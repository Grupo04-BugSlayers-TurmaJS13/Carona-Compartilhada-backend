import { IsEmail, IsNotEmpty, IsNumber, IsOptional, MinLength } from "class-validator"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Exclude, Transform, TransformFnParams } from "class-transformer"
import { Viagem } from "../../viagens/entities/viagem.entity"


@Entity({ name: "tb_usuarios" })
export class Usuario {


    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty()
    @Column({ length: 255, nullable: false })

    nome: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsEmail()
    @IsNotEmpty()
    @Column({ length: 255, nullable: false })

    usuario: string

    
    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty()
    @Column({ length: 255, nullable: false })
    @Exclude({ toPlainOnly: true })
    @MinLength(8)
    senha: string

    @Column({ length: 5000 })
    @IsOptional()
    foto: string

    @OneToMany(() => Viagem, (viagem) => viagem.usuario)
    viagens: Viagem[]

    


}