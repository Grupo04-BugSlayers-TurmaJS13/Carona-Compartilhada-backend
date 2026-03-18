import { TypeOrmModule } from "@nestjs/typeorm";
import { Veiculo } from "./entities/veiculo.entity";
import { VeiculoController } from "./controller/veiculo.controller";
import { VeiculoService } from "./service/veiculo.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [TypeOrmModule.forFeature([Veiculo])],
    controllers: [VeiculoController],
    providers: [VeiculoService],
    exports: []
})

export class VeiculoModule {}