import { IsNotEmpty } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ViagemStatus } from "../../util/viagem-status.enum";
import { Veiculo } from "../../veiculos/entities/veiculo.entity";
import { Usuario } from "../../usuario/entities/usuario.entity";
import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";

@Entity({ name: 'tb_viagens' })
export class Viagem {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    @ApiProperty()
    id: number;

    @IsNotEmpty()
    @Column({ length: 100, nullable: false })
    @ApiProperty()
    embarque: string;

    @IsNotEmpty()
    @Column({ length: 100, nullable: false })
    @ApiProperty()
    destino: string;

    @IsNotEmpty()
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    @ApiProperty()
    distancia: number;

    @Column({ type: 'int', nullable: false })
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
    @Column({ type: 'enum', enum: ["Dinheiro", "Cartão", "Pix"], default: "Dinheiro" })
    @ApiProperty()
    pagamento: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    @ApiProperty()
    valor: number;

    @ApiProperty({ type: () => Veiculo })
    @ManyToOne(() => Veiculo)
    veiculo: Veiculo;

    @ApiProperty({ type: () => Usuario })
    @ManyToOne(() => Usuario)
    usuario: Usuario;

    @ApiProperty({ type: () => Usuario, required: false })
    @ManyToOne(() => Usuario, { nullable: true })
    usuarioContratante?: Usuario;
}
