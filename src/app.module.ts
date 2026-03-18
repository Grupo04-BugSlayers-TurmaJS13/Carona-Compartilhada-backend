import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    database: 'db_carona_compartilhada',
    synchronize: true,
    autoLoadEntities: true,//Carrega todas as entidades automaticamente, 
    // sem precisar importar cada uma no forRoot
  }),UsuarioModule,
  AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }