import { TypeOrmModule } from '@nestjs/typeorm';
import { CiudadEntity } from '../../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../../supermercado/supermercado.entity';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    entities: [CiudadEntity, SupermercadoEntity],
    dropSchema: true,
    synchronize: true,
    keepConnectionAlive: true,
  }),
  TypeOrmModule.forFeature([CiudadEntity, SupermercadoEntity]),
];
