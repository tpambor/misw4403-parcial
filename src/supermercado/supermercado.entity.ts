import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';

@Entity()
export class SupermercadoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ type: 'real' })
  longitud: number;

  @Column({ type: 'real' })
  latitud: number;

  @Column()
  paginaWeb: string;

  @ManyToMany(() => CiudadEntity, (ciudad) => ciudad.supermercados)
  ciudades: CiudadEntity[];
}
