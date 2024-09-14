import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    entities: [],
    dropSchema: true,
    synchronize: true,
    keepConnectionAlive: true,
  }),
  TypeOrmModule.forFeature([]),
];
