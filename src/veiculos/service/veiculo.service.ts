import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Veiculo } from "../entities/veiculo.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, ILike, Repository } from "typeorm";

@Injectable()
export class VeiculoService {

    constructor(
        @InjectRepository(Veiculo)
        private veiculoRepository: Repository<Veiculo>
    ) { }

    async findAll(): Promise<Veiculo[]> {
        return await this.veiculoRepository.find();
    }

    async findById(id: number): Promise<Veiculo> {
        const veiculo = await this.veiculoRepository.findOne({
            where: { id }
        })

        if (!veiculo)
            throw new HttpException("Veículo não encontrado", HttpStatus.NOT_FOUND)

        return veiculo
    }

    async findByModelo(modelo: string): Promise<Veiculo[]> {
        return this.veiculoRepository.find({
            where: { modelo: ILike(`%${modelo}%`) }
        })
    }

    async create(veiculo: Veiculo): Promise<Veiculo> {
        const placaExistente = await this.veiculoRepository.findOne({
            where: { placa: veiculo.placa }
        });

        if (placaExistente)
            throw new HttpException("Já existe um veículo com essa placa", HttpStatus.BAD_REQUEST)

        return await this.veiculoRepository.save(veiculo)
    }

    async update(veiculo: Veiculo): Promise<Veiculo> {

        if (!veiculo.id || veiculo.id <= 0)
            throw new HttpException("Veiculo inválido", HttpStatus.BAD_REQUEST)

        await this.findById(veiculo.id)

        const placaExistente = await this.veiculoRepository.findOne({
            where: { placa: veiculo.placa }
        });

        if (placaExistente && placaExistente.id !== veiculo.id) {
            throw new HttpException(
                "Já existe outro veículo com essa placa",
                HttpStatus.BAD_REQUEST
            );
        }

        return await this.veiculoRepository.save(veiculo)
    }

    async delete(id: number): Promise<DeleteResult> {
        await this.findById(id)

        return await this.veiculoRepository.delete(id)
    }

}
