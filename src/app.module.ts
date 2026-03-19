import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeiculoModule } from './veiculos/veiculo.module';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ViagemModule } from './viagens/viagem.module';

@Module({

  imports: [TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1306',
      database: 'db_loja_games_bloco2',
      autoLoadEntities: true, 
      synchronize: true,
      
    }),
    VeiculoModule,
    UsuarioModule,
    ViagemModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }