import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
