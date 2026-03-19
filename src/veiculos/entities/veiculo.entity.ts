import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IsNotEmpty, Length } from "class-validator";
import { Transform } from "class-transformer";
import { TransformFnParams } from "class-transformer";
import { Viagem } from "../../viagens/entities/viagem.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum TipoVeiculo {
    CARRO = "CARRO",
    MOTO = "MOTO"
}

@Entity({ name: "tb_veiculos" })
export class Veiculo { 

    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number
    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "A foto é obrigatória"})
    @Length(3, 500)
    @Column()
    @ApiProperty()
    foto: string;

    @IsNotEmpty({ message: "Escolha o tipo de veículo"})
    @Column({
        type: "enum",
        enum: TipoVeiculo
    })
    @ApiProperty()
    tipo: TipoVeiculo

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "A marca do carro é obrigatória"})
    @Length(2, 100)
    @Column()
    @ApiProperty()
    modelo: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "A marca do carro é obrigatória"})
    @Length(2, 100)
    @Column()
    @ApiProperty()
    marca: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "A cor do carro é obrigatória"})
    @Length(3, 100)
    @Column()
    @ApiProperty()
    cor_veiculo: string

    @Transform(({ value }: TransformFnParams) => value?.toUpperCase().trim())
    @IsNotEmpty({ message: "A placa é obrigatória"})
    @Length(7, 10)
    @Column({ unique: true })
    @ApiProperty()
    placa: string

    @ApiProperty({ type: () => Viagem, isArray: true })
    @OneToMany(() => Viagem, (viagem) => viagem.veiculo)
    viagens: Viagem[]
}



