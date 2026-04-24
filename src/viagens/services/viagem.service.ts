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

    
}