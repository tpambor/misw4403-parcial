import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';

@Injectable()
export class CiudadSupermercadoService {
  constructor(
    @InjectRepository(CiudadEntity)
    private readonly ciudadRepository: Repository<CiudadEntity>,

    @InjectRepository(SupermercadoEntity)
    private readonly supermercadoRepository: Repository<SupermercadoEntity>,
  ) {}

  async addSupermarketToCity(
    ciudadId: string,
    supermercadoId: string,
  ): Promise<CiudadEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id: supermercadoId },
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    ciudad.supermercados = [...ciudad.supermercados, supermercado];
    return await this.ciudadRepository.save(ciudad);
  }

  async findSupermarketsFromCity(
    ciudadId: string,
  ): Promise<SupermercadoEntity[]> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });

    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    return ciudad.supermercados;
  }

  async findSupermarketFromCity(
    ciudadId: string,
    supermercadoId: string,
  ): Promise<SupermercadoEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id: supermercadoId },
        relations: ['ciudades'],
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    const ciudadSupermercado: CiudadEntity = supermercado.ciudades.find(
      (e) => e.id === ciudad.id,
    );

    if (!ciudadSupermercado)
      throw new BusinessLogicException(
        'El supermercado no pertenece a la ciudad con el id dado.',
        BusinessError.PRECONDITION_FAILED,
      );

    return supermercado;
  }

  async updateSupermarketsFromCity(
    ciudadId: string,
    supermercados: SupermercadoEntity[],
  ): Promise<CiudadEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });

    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < supermercados.length; i++) {
      const supermercado: SupermercadoEntity =
        await this.supermercadoRepository.findOne({
          where: { id: supermercados[i].id },
        });
      if (!supermercado)
        throw new BusinessLogicException(
          `El supermercado con el id ${supermercados[i].id} no existe.`,
          BusinessError.NOT_FOUND,
        );

      supermercados[i] = supermercado;
    }

    ciudad.supermercados = supermercados;
    return await this.ciudadRepository.save(ciudad);
  }

  async deleteSupermarketFromCity(ciudadId: string, supermercadoId: string) {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id: supermercadoId },
        relations: ['ciudades'],
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      );

    const ciudadSupermercado: CiudadEntity = supermercado.ciudades.find(
      (e) => e.id === ciudad.id,
    );

    if (!ciudadSupermercado)
      throw new BusinessLogicException(
        'El supermercado no pertenece a la ciudad con el id dado.',
        BusinessError.PRECONDITION_FAILED,
      );

    supermercado.ciudades = supermercado.ciudades.filter(
      (e) => e.id !== ciudad.id,
    );
    await this.supermercadoRepository.save(supermercado);
  }
}
