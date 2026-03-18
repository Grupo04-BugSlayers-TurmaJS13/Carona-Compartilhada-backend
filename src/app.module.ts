import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViagemModule } from './viagens/viagem.module';
import { ViagemService } from './viagens/services/viagem.service';
import { ViagemController } from './viagens/controllers/viagem.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1306',
      database: 'db_bip',
      autoLoadEntities: true,
      synchronize: true,
      
    }),
    ViagemModule
  ],
  controllers: [],
  providers: [ ],
})
export class AppModule {}
