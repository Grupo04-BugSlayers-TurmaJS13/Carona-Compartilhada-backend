import { IsNotEmpty } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ViagemStatus } from "../../util/viagem-status.enum";
import { Transform,TransformFnParams } from "class-transformer";

@Entity({ name: 'tb_viagens' })
export class Viagem {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Transform(({value } : TransformFnParams) => value?.trim()) // remover espaços em branco do inicio e fim
    @IsNotEmpty() // Força digitação
    @Column({length: 100, nullable: false}) // VARCHAR(100) NOT NULL
    embarque: string;

    @Transform(({value } : TransformFnParams) => value?.trim()) // remover espaços em branco do inicio e fim
    @IsNotEmpty() // Força digitação
    @Column({length: 100, nullable: false}) // VARCHAR(100) NOT NULL
    destino: string;

    
    @IsNotEmpty()
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    distancia: number;

    @Column({ type: 'int', nullable: false })
    tempoViagem: number;

    @Column({ type: 'enum', enum: ViagemStatus, default: ViagemStatus.SOLICITADA })
    status: string;

    @Column({ default: false })
    agendamento: boolean;

    @Column({ type: 'datetime', nullable: true })
    dataAgendamento: Date;

    @Column({ type: 'datetime', nullable: true })
    dataEncerramento: Date;

    @IsNotEmpty()
    @Column({ type: 'enum', enum: ["Dinheiro", "Cartão", "Pix"], nullable: false })
    pagamento: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;



   
}