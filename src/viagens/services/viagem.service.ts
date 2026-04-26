import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DeleteResult } from 'typeorm';
import { Viagem } from '../entities/viagem.entity';
import { ViagemStatus } from '../../util/viagem-status.enum';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class ViagemService {
  constructor(
    @InjectRepository(Viagem)
    private viagemRepository: Repository<Viagem>,
  ) { }

  async findAll(): Promise<Viagem[]> {
    return this.viagemRepository.find({
      relations: { veiculo: true, usuario: true, usuarioContratante: true },
    });
  }

  async findByid(id: number): Promise<Viagem> {
    const viagem = await this.viagemRepository.findOne({
      where: { id: Number(id) },
      relations: { veiculo: true, usuario: true, usuarioContratante: true },
    });
    if (!viagem)
      throw new HttpException('Viagem não encontrada!', HttpStatus.NOT_FOUND);
    return viagem;
  }

  async findByDestino(destino: string): Promise<Viagem> {
    const viagem = await this.viagemRepository.findOne({
      where: { destino: ILike(`%${destino}%`) },
      relations: { veiculo: true, usuario: true, usuarioContratante: true },
    });
    if (!viagem)
      throw new HttpException('Viagem não encontrada!', HttpStatus.NOT_FOUND);
    return viagem;
  }

  async create(viagem: Viagem): Promise<Viagem> {
    viagem.status = this.normalizarStatus(viagem.status);
    this.verificarStatusValido(viagem.status);
    this.ajustarDataAgendamento(viagem);
    try {
      return await this.viagemRepository.save(viagem);
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      throw new HttpException(
        error?.message ?? 'Erro ao salvar viagem. Verifique os dados e relacionamentos.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(viagem: Viagem): Promise<Viagem> {
    const id = Number(viagem.id);
    if (!id || id <= 0)
      throw new HttpException('O ID da viagem é inválido!', HttpStatus.BAD_REQUEST);

    await this.findByid(id);

    const status = this.normalizarStatus(viagem.status);
    this.verificarStatusValido(status);

    const dadosParaAtualizar = {
      embarque: viagem.embarque,
      destino: viagem.destino,
      distancia: viagem.distancia,
      tempoViagem: Number(viagem.tempoViagem),
      status,
      agendamento: viagem.agendamento,
      dataAgendamento: viagem.agendamento
        ? new Date(viagem.dataAgendamento)
        : new Date(),
      dataEncerramento: viagem.dataEncerramento
        ? new Date(viagem.dataEncerramento)
        : null,
      pagamento: viagem.pagamento,
      valor: Number(viagem.valor),
      veiculo: viagem.veiculo,
      usuario: viagem.usuario,
      usuarioContratante: viagem.usuarioContratante,
    } as any;

    try {
      await this.viagemRepository.update(id, dadosParaAtualizar);
      return await this.findByid(id);
    } catch (error) {
      console.error('Erro ao atualizar viagem:', error);
      throw new HttpException(
        error?.message ?? 'Erro ao atualizar viagem.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findByid(Number(id));
    return await this.viagemRepository.delete(Number(id));
  }

  async encerrarViagem(id: number, dataEncerramento: Date): Promise<Viagem> {
    const viagem = await this.findByid(Number(id));
    if (viagem.status === ViagemStatus.CONCLUIDA)
      throw new HttpException('A viagem já foi encerrada.', HttpStatus.BAD_REQUEST);
    viagem.dataEncerramento = dataEncerramento || new Date();
    viagem.status = ViagemStatus.CONCLUIDA;
    return await this.viagemRepository.save(viagem);
  }

  private verificarStatusValido(status: string): void {
    const statusValidos = Object.values(ViagemStatus);
    if (!statusValidos.includes(status as ViagemStatus)) {
      throw new HttpException('Status da viagem é inválido!', HttpStatus.BAD_REQUEST);
    }
  }

  private normalizarStatus(status?: string): string {
    if (!status) return ViagemStatus.SOLICITADA;
    return status.trim().toUpperCase().replace(/\s+/g, '_');
  }

  private ajustarDataAgendamento(viagem: Viagem): void {
    if (!viagem.agendamento) {
      viagem.dataAgendamento = new Date();
      return;
    }
    if (!viagem.dataAgendamento)
      throw new HttpException('dataAgendamento é obrigatória.', HttpStatus.BAD_REQUEST);
    const data = new Date(viagem.dataAgendamento);
    if (Number.isNaN(data.getTime()))
      throw new HttpException('dataAgendamento inválida.', HttpStatus.BAD_REQUEST);
    viagem.dataAgendamento = data;
  }

  async contratar(id: number, usuarioContratanteId: number): Promise<Viagem> {
    const viagem = await this.findByid(id)

    viagem.status = ViagemStatus.ACEITA  // ← ou o status correto do enum
    viagem.usuarioContratante = { id: usuarioContratanteId } as Usuario

    return this.viagemRepository.save(viagem)
  }
}