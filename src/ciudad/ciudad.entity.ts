import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';

@Entity()
export class CiudadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  pais: string;

  @Column()
  habitantes: number;

  @ManyToMany(() => SupermercadoEntity, (supermercado) => supermercado.ciudades)
  @JoinTable()
  supermercados: SupermercadoEntity[];
}
