import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeiculoModule } from './veiculos/veiculo.module';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ViagemModule } from './viagens/viagem.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ProdService } from './data/services/prod.service';
import { DevService } from './data/services/dev.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useClass: process.env.NODE_ENV === 'production' ? ProdService : DevService,
      imports: [ConfigModule],
    }),
    VeiculoModule,
    UsuarioModule,
    ViagemModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}