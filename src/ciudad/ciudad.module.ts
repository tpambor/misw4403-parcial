import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CiudadEntity } from './ciudad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CiudadEntity])],
})
export class CiudadModule {}
