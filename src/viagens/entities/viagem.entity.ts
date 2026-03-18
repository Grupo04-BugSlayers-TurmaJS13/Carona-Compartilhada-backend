import { IsNotEmpty } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../../usuario/entities/usuario.entity";
import { Motorista } from "../../motorista/entities/motorista.entity";
import { ViagemStatus } from "../enums/viagem-status.enum";

@Entity({ name: 'tb_viagens' })
export class Viagem {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: number;

    @IsNotEmpty()
    @Column({ length: 255, nullable: false })
    embarque!: string;

    @IsNotEmpty()
    @Column({ length: 255, nullable: false })
    destino!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    distancia!: number;

    @Column({ type: 'enum', enum: ViagemStatus, default: ViagemStatus.SOLICITADA })
    status!: ViagemStatus;

    @Column({ default: false })
    agendamento!: boolean;

    @Column({ type: 'datetime', nullable: true })
    data_agendamento!: Date;

    @Column({ default: false })
    pagamento!: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    valor!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => Usuario, (usuario) => usuario.viagens, { nullable: false })
    @JoinColumn({ name: 'usuario_id' })
    usuario!: Usuario;

    @ManyToOne(() => Motorista, (motorista) => motorista.viagens, { nullable: true })
    @JoinColumn({ name: 'motorista_id' })
    motorista?: Motorista;
}