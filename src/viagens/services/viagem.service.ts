import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, DeleteResult } from "typeorm";
import { Viagem } from "../entities/viagem.entity";
import { ViagemStatus } from "../../util/viagem-status.enum";





@Injectable()
export class ViagemService{

    constructor(
        @InjectRepository(Viagem)
        private viagemRepository : Repository<Viagem>,

    ){}

    async findAll():  Promise<Viagem[]>{
        // SELECT * FROM tb_viagems;
        return this.viagemRepository.find({ relations: { veiculo: true, usuario: true } });
    }

    
    async findByid(id: number): Promise<Viagem>{
        // SELECT * FROM tb_viagems where id = ? ;
        const viagem = await this.viagemRepository.findOne({
            where:{
                id: id
            },
            relations: { veiculo: true, usuario: true }
        })

        if(!viagem)
            throw new HttpException("Viagem não encontrada!", HttpStatus.NOT_FOUND);

        return viagem;
    }

    async findByDestino(destino: string): Promise<Viagem>{
        // SELECT * FROM tb_viagems where id = ? ;
        const viagem = await this.viagemRepository.findOne({
            where:{
                destino: ILike(`%${destino}%`)
            },
            relations: { veiculo: true, usuario: true }
        })

        if(!viagem)
            throw new HttpException("Viagem não encontrada!", HttpStatus.NOT_FOUND);

        return viagem;
    }

    
    
    async create(viagem: Viagem): Promise<Viagem>{

        viagem.status = this.normalizarStatus(viagem.status);
        this.verificarStatusValido(viagem.status);
        this.ajustarDataAgendamento(viagem);
        await this.calcularDistanciaETempo(viagem);
        this.calcularValorViagem(viagem);
        //INSERT INTO tb_viagems (nome, texto) VALUES(?, ?);
        return await this.viagemRepository.save(viagem);
    }

    async update(viagem: Viagem): Promise<Viagem>{
        
        if(!viagem.id || viagem.id <= 0)
            throw new HttpException("O ID da viagem é inválido!", HttpStatus.BAD_REQUEST);

        // Checa se a viagem existe e preserva os campos caso o payload venha parcial.
        const viagemExistente = await this.findByid(viagem.id);
        const viagemAtualizada = this.viagemRepository.merge(viagemExistente, viagem);

        viagemAtualizada.status = this.normalizarStatus(viagemAtualizada.status);
        this.verificarStatusValido(viagemAtualizada.status);
        this.ajustarDataAgendamento(viagemAtualizada);
        await this.calcularDistanciaETempo(viagemAtualizada);
        this.calcularValorViagem(viagemAtualizada);

        //UPDATE tb_viagems SET nome = ?, texto = ?, data = CURRENT_TIMESTAMP() WHERE id = ?;
        return await this.viagemRepository.save(viagemAtualizada);
    }

    async delete(id: number): Promise<DeleteResult>{
        
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
        if(!viagem.dataEncerramento) {
          viagem.dataEncerramento = new Date();
        }
        viagem.dataEncerramento = dataEncerramento;
        viagem.status = ViagemStatus.CONCLUIDA;
        this.calcularValorViagem(viagem);
        this.adicionarTaxaTempoExtra(viagem);

        return await this.viagemRepository.save(viagem);
    }



    private verificarStatusValido(status: string): void{
        const statusValidos = Object.values(ViagemStatus);
        if(!statusValidos.includes(status as ViagemStatus)){
            throw new HttpException("Status da viagem é inválido! Deve ser 'SOLICITADA', 'ACEITA', 'EM_ANDAMENTO', 'CONCLUIDA' ou 'CANCELADA'", HttpStatus.BAD_REQUEST);
        }
        
    }

    private normalizarStatus(status?: string): string {
        if (!status) {
            return ViagemStatus.SOLICITADA;
        }

        return status.trim().toUpperCase().replace(/\s+/g, "_");
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

    private async calcularDistanciaETempo(viagem: Viagem): Promise<void> {
        if (!viagem.embarque || !viagem.destino) {
            throw new HttpException(
                "embarque e destino são obrigatórios para calcular distância automaticamente.",
                HttpStatus.BAD_REQUEST,
            );
        }

        const origem = await this.obterCoordenadas(viagem.embarque);
        const destino = await this.obterCoordenadas(viagem.destino);

        if (!origem || !destino) {
            throw new HttpException(
                "Não foi possível localizar embarque ou destino para calcular a rota.",
                HttpStatus.BAD_REQUEST,
            );
        }

        const rota = await this.obterRota(origem, destino);

        if (rota) {
            viagem.distancia = Number((rota.distanciaMetros / 1000).toFixed(2));
            viagem.tempoViagem = Math.ceil(rota.duracaoSegundos / 60);
            return;
        }

        // Fallback: quando o serviço de rota falhar, estima por linha reta.
        const distanciaEstimativaKm = this.calcularDistanciaHaversine(
            origem.latitude,
            origem.longitude,
            destino.latitude,
            destino.longitude,
        );

        viagem.distancia = Number(distanciaEstimativaKm.toFixed(2));
        viagem.tempoViagem = Math.ceil((distanciaEstimativaKm / 35) * 60);
    }

    private async obterCoordenadas(endereco: string): Promise<{ latitude: number; longitude: number } | null> {
        const query = encodeURIComponent(`${endereco}, Brasil`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "carona-compartilhada-backend/1.0",
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = (await response.json()) as Array<{ lat: string; lon: string }>;
            const localizacao = data[0];

            if (!localizacao) {
                return null;
            }

            return {
                latitude: Number(localizacao.lat),
                longitude: Number(localizacao.lon),
            };
        } catch {
            return null;
        }
    }

    private async obterRota(
        origem: { latitude: number; longitude: number },
        destino: { latitude: number; longitude: number },
    ): Promise<{ distanciaMetros: number; duracaoSegundos: number } | null> {
        const url = `https://router.project-osrm.org/route/v1/driving/${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}?overview=false`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                return null;
            }

            const data = (await response.json()) as {
                routes?: Array<{ distance: number; duration: number }>;
            };

            const rotaPrincipal = data.routes?.[0];
            if (!rotaPrincipal) {
                return null;
            }

            return {
                distanciaMetros: rotaPrincipal.distance,
                duracaoSegundos: rotaPrincipal.duration,
            };
        } catch {
            return null;
        }
    }

    private calcularDistanciaHaversine(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const raioTerraKm = 6371;
        const dLat = this.grausParaRadianos(lat2 - lat1);
        const dLon = this.grausParaRadianos(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.grausParaRadianos(lat1)) *
                Math.cos(this.grausParaRadianos(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return raioTerraKm * c;
    }

    private grausParaRadianos(graus: number): number {
        return (graus * Math.PI) / 180;
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

    
}