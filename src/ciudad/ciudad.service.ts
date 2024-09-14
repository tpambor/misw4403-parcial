import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { CiudadEntity } from './ciudad.entity';

const PAISES_VALIDOS = ['Argentina', 'Ecuador', 'Paraguay'];

@Injectable()
export class CiudadService {
  constructor(
    @InjectRepository(CiudadEntity)
    private readonly ciudadRepository: Repository<CiudadEntity>,
  ) {}

  async findAll(): Promise<CiudadEntity[]> {
    return await this.ciudadRepository.find({ relations: ['supermercados'] });
  }

  async findOne(id: string): Promise<CiudadEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
      relations: ['supermercados'],
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    return ciudad;
  }

  async create(ciudad: CiudadEntity): Promise<CiudadEntity> {
    if (!PAISES_VALIDOS.includes(ciudad.pais))
      throw new BusinessLogicException(
        'El país de la ciudad no es válido.',
        BusinessError.PRECONDITION_FAILED,
      );

    return await this.ciudadRepository.save(ciudad);
  }

  async update(id: string, ciudad: CiudadEntity): Promise<CiudadEntity> {
    const persistedCiudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
    });
    if (!persistedCiudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    if (!PAISES_VALIDOS.includes(ciudad.pais))
      throw new BusinessLogicException(
        'El país de la ciudad no es válido.',
        BusinessError.PRECONDITION_FAILED,
      );

    return await this.ciudadRepository.save({
      ...persistedCiudad,
      ...ciudad,
    });
  }

  async delete(id: string) {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    await this.ciudadRepository.remove(ciudad);
  }
}
