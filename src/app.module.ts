import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViagensModule } from './viagens/viagens.module';
import { ViagensService } from './viagens/viagens.service';
import { ViagensController } from './viagens/services/viagem.controller';

@Module({
  imports: [ViagensModule],
  controllers: [ViagensController],
  providers: [ ViagensService],
})
export class AppModule {}
