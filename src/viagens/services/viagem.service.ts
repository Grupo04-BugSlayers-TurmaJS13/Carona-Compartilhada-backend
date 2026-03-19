import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, DeleteResult, LessThan, MoreThan } from "typeorm";
import { Viagem } from "../entities/viagem.entity";
import { ViagemStatus } from "../../util/viagem-status.enum";
import axios from "axios";
import { getDistance } from "geolib";

@Injectable()
export class ViagemService {

    constructor(
        @InjectRepository(Viagem)
        private viagemRepository: Repository<Viagem>,

    ) { }

    async findAll(): Promise<Viagem[]> {
        // SELECT * FROM tb_viagems;
        return this.viagemRepository.find({ relations: { veiculo: true, usuario: true } });
    }


    async findByid(id: number): Promise<Viagem> {
        // SELECT * FROM tb_viagems where id = ? ;
        const viagem = await this.viagemRepository.findOne({
            where: {
                id: id
            },
            relations: { veiculo: true, usuario: true }
        })

        if (!viagem)
            throw new HttpException("Viagem não encontrada!", HttpStatus.NOT_FOUND);

        return viagem;
    }

    async findByDestino(destino: string): Promise<Viagem> {
        // SELECT * FROM tb_viagems where id = ? ;
        const viagem = await this.viagemRepository.findOne({
            where: {
                destino: ILike(`%${destino}%`)
            },
            relations: { veiculo: true, usuario: true }
        })

        if (!viagem)
            throw new HttpException("Viagem não encontrada!", HttpStatus.NOT_FOUND);

        return viagem;
    }

    async create(viagem: Viagem): Promise<Viagem> {

        this.verificarStatusValido(viagem.status);
        this.ajustarDataAgendamento(viagem);
        // this.calcularTempoViagem(viagem);
        // this.calcularValorViagem(viagem);

        const origem = await this.obterCoordenadas(viagem.embarque);
        const destino = await this.obterCoordenadas(viagem.destino);

        viagem.latOrigem = origem.lat;
        viagem.lonOrigem = origem.lon;

        viagem.latDestino = destino.lat;
        viagem.lonDestino = destino.lon;

        // 🔥 cálculos automáticos
        this.calcularDistancia(viagem);
        this.calcularTempoViagem(viagem);
        this.calcularValorViagem(viagem);

        //INSERT INTO tb_viagems (nome, texto) VALUES(?, ?);
        return await this.viagemRepository.save(viagem);
    }

    async update(viagem: Viagem): Promise<Viagem> {

        if (!viagem.id || viagem.id <= 0)
            throw new HttpException("O ID da viagem é inválido!", HttpStatus.BAD_REQUEST);

        //Checa se a Viagem existe
        await this.findByid(viagem.id);

        this.verificarStatusValido(viagem.status);
        this.ajustarDataAgendamento(viagem);
        // this.calcularTempoViagem(viagem);
        // this.calcularValorViagem(viagem);

        const origem = await this.obterCoordenadas(viagem.embarque);
        const destino = await this.obterCoordenadas(viagem.destino);

        viagem.latOrigem = origem.lat;
        viagem.lonOrigem = origem.lon;

        viagem.latDestino = destino.lat;
        viagem.lonDestino = destino.lon;

        this.calcularDistancia(viagem);
        this.calcularTempoViagem(viagem);
        this.calcularValorViagem(viagem);

        //UPDATE tb_viagems SET nome = ?, texto = ?, data = CURRENT_TIMESTAMP() WHERE id = ?;
        return await this.viagemRepository.save(viagem);
    }

    async delete(id: number): Promise<DeleteResult> {

        await this.findByid(id);

        //DELETE tb_viagems FROM  ID = ?;
        return await this.viagemRepository.delete(id);
    }

    async encerrarViagem(id: number, dataEncerramento: Date): Promise<Viagem> {
        if (!id || id <= 0) {
            throw new HttpException(
                "O ID da viagem é inválido!",
                HttpStatus.BAD_REQUEST,
            );
        }

        const viagem = await this.findByid(id);

        if (viagem.status === ViagemStatus.CONCLUIDA) {
            throw new HttpException(
                "A viagem já foi encerrada.",
                HttpStatus.BAD_REQUEST,
            );
        }
        if (!viagem.dataEncerramento) {
            viagem.dataEncerramento = new Date();
        }
        viagem.dataEncerramento = dataEncerramento;
        viagem.status = ViagemStatus.CONCLUIDA;
        this.calcularValorViagem(viagem);
        this.adicionarTaxaTempoExtra(viagem);

        return await this.viagemRepository.save(viagem);
    }

    private verificarStatusValido(status: string): void {
        const statusValidos = ["Solicitada", "Aceita", "Em Andamento", "Concluida", "Cancelada"];
        if (!statusValidos.includes(status)) {
            throw new HttpException("Status da viagem é inválido! Deve ser 'Solicitada', 'Aceita', 'Em Andamento', 'Concluida' ou 'Cancelada'", HttpStatus.BAD_REQUEST);
        }

    }

    private ajustarDataAgendamento(viagem: Viagem): void {
        if (!viagem.agendamento) {
            viagem.dataAgendamento = new Date();
            return;
        }

        if (!viagem.dataAgendamento) {
            throw new HttpException(
                "dataAgendamento é obrigatória quando agendamento for verdadeiro.",
                HttpStatus.BAD_REQUEST,
            );
        }

        const data = new Date(viagem.dataAgendamento);
        if (Number.isNaN(data.getTime())) {
            throw new HttpException(
                "dataAgendamento inválida.",
                HttpStatus.BAD_REQUEST,
            );
        }

        viagem.dataAgendamento = data;
    }

    private calcularTempoViagem(viagem: Viagem): void {
        if (viagem.distancia === null || viagem.distancia === undefined) {
            throw new HttpException(
                "distancia é obrigatória para calcular tempoViagem.",
                HttpStatus.BAD_REQUEST,
            );
        }

        const distancia = Number(viagem.distancia);
        if (Number.isNaN(distancia) || distancia <= 0) {
            throw new HttpException(
                "distancia inválida. Informe um valor maior que zero.",
                HttpStatus.BAD_REQUEST,
            );
        }

        const velocidadeMediaKmH = 50;
        const tempoEmHoras = distancia / velocidadeMediaKmH;

        // Armazena o tempo estimado em minutos.
        viagem.tempoViagem = Math.ceil(tempoEmHoras * 60);
    }

    private calcularValorViagem(viagem: Viagem): void {
        const distancia = Number(viagem.distancia);
        const tempoViagem = Number(viagem.tempoViagem);

        if (Number.isNaN(distancia) || Number.isNaN(tempoViagem)) {
            throw new HttpException(
                "Não foi possível calcular o valor da viagem. Distância ou tempo inválidos.",
                HttpStatus.BAD_REQUEST,
            );
        }

        viagem.valor = Number((distancia * 1 + tempoViagem * 0.2).toFixed(2));
    }

    private adicionarTaxaTempoExtra(viagem: Viagem): void {
        if (!viagem.dataAgendamento || !viagem.dataEncerramento) {
            return;
        }

        const dataInicio = new Date(viagem.dataAgendamento);
        const dataFim = new Date(viagem.dataEncerramento);

        if (Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime())) {
            throw new HttpException(
                "Datas de agendamento ou encerramento inválidas.",
                HttpStatus.BAD_REQUEST,
            );
        }

        const tempoRealMinutos = Math.floor((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60));
        const tempoEsperadoMinutos = Number(viagem.tempoViagem);

        if (tempoRealMinutos > tempoEsperadoMinutos) {
            const minutosExtras = tempoRealMinutos - tempoEsperadoMinutos;
            const taxaExtra = minutosExtras * 0.5;
            viagem.valor = Number((Number(viagem.valor) + taxaExtra).toFixed(2));
        }
    }

    // Métodos de Cálculos
    private async obterCoordenadas(endereco: string) {

        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: endereco,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "app-carona"
            }
        });

        if (!response.data || response.data.length === 0) {
            throw new HttpException("Endereço não encontrado", HttpStatus.BAD_REQUEST);
        }

        return {
            lat: parseFloat(response.data[0].lat),
            lon: parseFloat(response.data[0].lon)
        };
    }

    private calcularDistancia(viagem: Viagem): void {

        const distanciaMetros = getDistance(
            { latitude: viagem.latOrigem, longitude: viagem.lonOrigem },
            { latitude: viagem.latDestino, longitude: viagem.lonDestino }
        );

        viagem.distancia = Number((distanciaMetros / 1000).toFixed(2));
    }

}