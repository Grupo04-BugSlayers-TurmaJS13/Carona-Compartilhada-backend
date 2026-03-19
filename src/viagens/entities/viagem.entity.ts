import { IsNotEmpty } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ViagemStatus } from "../../util/viagem-status.enum";
import { Transform, TransformFnParams } from "class-transformer";
import { Veiculo } from "../../veiculos/entities/veiculo.entity";
import { Usuario } from "../../usuario/entities/usuario.entity";
import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";

@Entity({ name: 'tb_viagens' })
export class Viagem {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    @ApiProperty()
    id: number;

    @Transform(({ value }: TransformFnParams) => value?.trim()) // remover espaços em branco do inicio e fim
    @IsNotEmpty() // Força digitação
    @Column({ length: 255, nullable: false }) // VARCHAR(100) NOT NULL
    @ApiProperty()
    embarque: string;

    @Transform(({ value }: TransformFnParams) => value?.trim()) // remover espaços em branco do inicio e fim
    @IsNotEmpty() // Força digitação
    @Column({ length: 255, nullable: false }) // VARCHAR(100) NOT NULL
    @ApiProperty()
    destino: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    @ApiProperty()
    distancia: number;

    @Column({ type: 'int', nullable: true })
    @ApiProperty()
    tempoViagem: number;

    @Column({ type: 'enum', enum: ViagemStatus, default: ViagemStatus.SOLICITADA })
    @ApiProperty()
    status: string;

    @Column({ default: false })
    @ApiProperty()
    agendamento: boolean;

    @Column({ type: 'date', nullable: true })
    @ApiProperty()
    dataAgendamento: Date;

    @Column({ type: 'date', nullable: true })
    @ApiProperty()
    dataEncerramento: Date;

    @IsNotEmpty()
    @Column({ type: 'enum', enum: ["Dinheiro", "Cartão", "Pix"], nullable: false })
    @ApiProperty()
    pagamento: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    @ApiProperty()
    valor: number;

    //Coordenadas embarque
    @Column("decimal", { precision: 10, scale: 6 })
    @ApiProperty()
    latOrigem!: number;

    @Column("decimal", { precision: 10, scale: 6 })
    @ApiProperty()
    lonOrigem!: number;

    //Coordenadas destino
    @Column("decimal", { precision: 10, scale: 6 })
    @ApiProperty()
    latDestino!: number;

    @Column("decimal", { precision: 10, scale: 6 })
    @ApiProperty()
    lonDestino!: number;

    @ApiProperty({ type: () => Veiculo })
    @ManyToOne(() => Veiculo, (veiculo) => veiculo.id)
    veiculo: Veiculo;

    @ApiProperty({ type: () => Usuario })
    @ManyToOne(() => Usuario, (usuario) => usuario.id)
    usuario: Usuario;
}