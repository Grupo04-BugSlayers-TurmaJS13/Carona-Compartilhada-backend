import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateViagenDto } from './dto/create-viagem.dto';
import { UpdateViagenDto } from './dto/update-viagem.dto';
import { Viagem } from './entities/viagem.entity';

@Injectable()
export class ViagensService {
  constructor(
    @InjectRepository(Viagem)
    private readonly viagemRepository: Repository<Viagem>,
  ) {}

  async create(createViagenDto: CreateViagenDto) {
    // Aqui assumimos que o DTO já vem com o ID do usuário corretamente mapeado
    // ou que o NestJS fará o bind se o campo for usuario: { id: ... }
    const novaViagem = this.viagemRepository.create(createViagenDto);
    return this.viagemRepository.save(novaViagem);
  }

  findAll() {
    // Traz os dados do passageiro e do motorista junto com a viagem
    return this.viagemRepository.find({
      relations: ['usuario', 'motorista'],
    });
  }

  async findOne(id: number) {
    const viagem = await this.viagemRepository.findOne({
      where: { id },
      relations: ['usuario', 'motorista'],
    });
    if (!viagem) throw new NotFoundException(`Viagem com ID ${id} não encontrada.`);
    return viagem;
  }

  async update(id: number, updateViagenDto: UpdateViagenDto) {
    const viagem = await this.viagemRepository.preload({ id, ...updateViagenDto });
    if (!viagem) throw new NotFoundException(`Viagem com ID ${id} não encontrada.`);
    return this.viagemRepository.save(viagem);
  }

  async remove(id: number) {
    const viagem = await this.findOne(id);
    return this.viagemRepository.remove(viagem);
  }
}