import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupermercadoEntity } from './supermercado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupermercadoEntity])],
})
export class SupermercadoModule {}
