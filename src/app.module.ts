import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CiudadModule } from './ciudad/ciudad.module';
import { CiudadEntity } from './ciudad/ciudad.entity';
import { SupermercadoModule } from './supermercado/supermercado.module';
import { SupermercadoEntity } from './supermercado/supermercado.entity';
import { CiudadSupermercadoModule } from './ciudad-supermercado/ciudad-supermercado.module';

function databaseConfigFromEnv(): TypeOrmModuleOptions {
  const url = new URL(process.env.DATABASE_URL);
  const scheme = url.protocol.slice(0, -1);

  if (scheme === 'sqlite') {
    return {
      type: 'sqlite',
      database: url.pathname || url.host,
    };
  }

  if (scheme === 'postgres') {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
    };
  }

  throw new Error('Invalid database URL');
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...databaseConfigFromEnv(),
      entities: [CiudadEntity, SupermercadoEntity],
      dropSchema: true,
      synchronize: true,
      keepConnectionAlive: true,
    }),
    CiudadModule,
    SupermercadoModule,
    CiudadSupermercadoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
