import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, Length } from "class-validator";
import { Transform } from "class-transformer";
import { TransformFnParams } from "class-transformer";

export enum TipoVeiculo {
    CARRO = "CARRO",
    MOTO = "MOTO"
}

@Entity({ name: "tb_veiculos" })
export class Veiculo { 

    @PrimaryGeneratedColumn()
    id: number

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "O nome do motorista é obrigatório"})
    @Length(3, 255, { message: "O nome do motorista deve conter no mínimo 3 caracteres" })
    @Column()
    motorista: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "A foto é obrigatória"})
    @Length(3, 500)
    @Column()
    foto: string;

    @IsNotEmpty({ message: "Escolha o tipo de veículo"})
    @Column({
        type: "enum",
        enum: TipoVeiculo
    })
    tipo: TipoVeiculo

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "A marca do carro é obrigatória"})
    @Length(2, 100)
    @Column()
    modelo: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "A marca do carro é obrigatória"})
    @Length(2, 100)
    @Column()
    marca: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty({ message: "A cor do carro é obrigatória"})
    @Length(3, 100)
    @Column()
    cor_veiculo: string

    @Transform(({ value }: TransformFnParams) => value?.toUpperCase().trim())
    @IsNotEmpty({ message: "A placa é obrigatória"})
    @Length(7, 10)
    @Column({ unique: true })
    placa: string
}



