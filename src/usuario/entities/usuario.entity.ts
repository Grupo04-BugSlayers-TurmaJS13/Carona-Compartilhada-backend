import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, MinLength } from "class-validator"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Exclude, Transform, TransformFnParams } from "class-transformer"
import { Viagem } from "../../viagens/entities/viagem.entity"
import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator"


@Entity({ name: "tb_usuarios" })
export class Usuario {


    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty()
    @Column({ length: 255, nullable: false })
    @ApiProperty()
    nome: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsEmail()
    @IsNotEmpty()
    @Column({ length: 255, nullable: false })
    @ApiProperty()
    usuario: string

    @Transform(({ value }: TransformFnParams) => value?.trim())
    @IsNotEmpty()
    @Column({ length: 255, nullable: false })
    @Exclude({ toPlainOnly: true })
    @MinLength(8)
    @ApiProperty()
    senha: string

    @Column({ length: 5000 })
    @IsOptional()
    @ApiProperty()
    foto: string

    @IsNotEmpty()
    @Column({ type: "date", nullable: false })
    data_nascimento: Date

    @ApiProperty({ type: () => Viagem, isArray: true })
    @OneToMany(() => Viagem, (viagem) => viagem.usuario)
    viagens: Viagem[]

}