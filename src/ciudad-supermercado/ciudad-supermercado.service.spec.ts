import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';

const PAISES_VALIDOS = ['Argentina', 'Ecuador', 'Paraguay'];

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let supermercadoRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);

    ciudadRepository = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );

    supermercadoRepository = module.get<Repository<SupermercadoEntity>>(
      getRepositoryToken(SupermercadoEntity),
    );

    await seedDatabase();
  });

  const randomSupermarketName = (options?) => {
    const min = options?.min || 1;
    const max = options?.max || 50;
    let name: string;

    do {
      name = faker.company.name();
    } while (name.length < min || name.length > max);

    return name;
  };

  const seedDatabase = async () => {
    ciudadRepository.clear();
    supermercadoRepository.clear();

    supermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity =
        await supermercadoRepository.save({
          nombre: randomSupermarketName({ min: 11 }),
          longitud: faker.location.longitude(),
          latitud: faker.location.latitude(),
          paginaWeb: faker.internet.url(),
        });
      supermercadosList.push(supermercado);
    }

    ciudad = await ciudadRepository.save({
      nombre: faker.location.city(),
      pais: faker.helpers.arrayElement(PAISES_VALIDOS),
      habitantes: faker.number.int({ min: 10, max: 10000000 }),
      supermercados: supermercadosList,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity should add a supermarket to a city', async () => {
    const newSupermercado: SupermercadoEntity =
      await supermercadoRepository.save({
        nombre: randomSupermarketName({ min: 11 }),
        longitud: faker.location.longitude(),
        latitud: faker.location.latitude(),
        paginaWeb: faker.internet.url(),
      });

    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.location.city(),
      pais: faker.helpers.arrayElement(PAISES_VALIDOS),
      habitantes: faker.number.int({ min: 10, max: 10000000 }),
    });

    const result: CiudadEntity = await service.addSupermarketToCity(
      newCiudad.id,
      newSupermercado.id,
    );

    expect(result.supermercados.length).toBe(1);
    expect(result.supermercados[0]).not.toBeNull();
    expect(result.supermercados[0].nombre).toBe(newSupermercado.nombre);
    expect(result.supermercados[0].longitud).toBe(newSupermercado.longitud);
    expect(result.supermercados[0].latitud).toBe(newSupermercado.latitud);
    expect(result.supermercados[0].paginaWeb).toBe(newSupermercado.paginaWeb);
  });

  it('addSupermarketToCity should throw an exception for an invalid city', async () => {
    const newSupermercado: SupermercadoEntity =
      await supermercadoRepository.save({
        nombre: randomSupermarketName({ min: 11 }),
        longitud: faker.location.longitude(),
        latitud: faker.location.latitude(),
        paginaWeb: faker.internet.url(),
      });

    await expect(() =>
      service.addSupermarketToCity('doesNotExist', newSupermercado.id),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('addSupermarketToCity should throw an exception for an invalid supermarket', async () => {
    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.location.city(),
      pais: faker.helpers.arrayElement(PAISES_VALIDOS),
      habitantes: faker.number.int({ min: 10, max: 10000000 }),
    });

    await expect(() =>
      service.addSupermarketToCity(newCiudad.id, 'doesNotExist'),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('findSupermarketsFromCity should return supermarkets from the given city', async () => {
    const supermercados: SupermercadoEntity[] =
      await service.findSupermarketsFromCity(ciudad.id);

    // We don't care about the order of the elements, sort before comparing
    const supermercadosListSorted = supermercadosList.sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const supermercadosSorted = supermercados.sort((a, b) =>
      a.id.localeCompare(b.id),
    );

    expect(supermercadosSorted).toEqual(supermercadosListSorted);
  });

  it('findSupermarketsFromCity should throw an exception for an invalid city', async () => {
    await expect(() =>
      service.findSupermarketsFromCity('doesNotExist'),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('findSupermarketFromCity should return the supermarket form the city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    const storedSupermercado: SupermercadoEntity =
      await service.findSupermarketFromCity(ciudad.id, supermercado.id);

    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toBe(supermercado.nombre);
    expect(storedSupermercado.longitud).toBe(supermercado.longitud);
    expect(storedSupermercado.latitud).toBe(supermercado.latitud);
    expect(storedSupermercado.paginaWeb).toBe(supermercado.paginaWeb);
  });

  it('findSupermarketFromCity should throw an exception for an invalid city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];

    await expect(() =>
      service.findSupermarketFromCity('doesNotExist', supermercado.id),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('findSupermarketFromCity should throw an exception for an invalid supermarket', async () => {
    await expect(() =>
      service.findSupermarketFromCity(ciudad.id, 'doesNotExist'),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('findSupermarketFromCity should throw an exception for a supermarket that is not asociated to the city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];

    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.location.city(),
      pais: faker.helpers.arrayElement(PAISES_VALIDOS),
      habitantes: faker.number.int({ min: 10, max: 10000000 }),
    });

    await expect(() =>
      service.findSupermarketFromCity(newCiudad.id, supermercado.id),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'El supermercado no pertenece a la ciudad con el id dado.',
        BusinessError.PRECONDITION_FAILED,
      ),
    );
  });

  it('updateSupermarketsFromCity should update the list of supermarkets of the city', async () => {
    const newSupermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity =
        await supermercadoRepository.save({
          nombre: randomSupermarketName({ min: 11 }),
          longitud: faker.location.longitude(),
          latitud: faker.location.latitude(),
          paginaWeb: faker.internet.url(),
        });
      newSupermercadosList.push(supermercado);
    }

    const updatedCiudad: CiudadEntity =
      await service.updateSupermarketsFromCity(ciudad.id, newSupermercadosList);

    // We don't care about the order of the elements, sort before comparing
    const newSupermercadosListSorted = newSupermercadosList.sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const supermercadosSorted = updatedCiudad.supermercados.sort((a, b) =>
      a.id.localeCompare(b.id),
    );

    expect(supermercadosSorted).toEqual(newSupermercadosListSorted);
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid city', async () => {
    const newSupermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity =
        await supermercadoRepository.save({
          nombre: randomSupermarketName({ min: 11 }),
          longitud: faker.location.longitude(),
          latitud: faker.location.latitude(),
          paginaWeb: faker.internet.url(),
        });
      newSupermercadosList.push(supermercado);
    }

    await expect(() =>
      service.updateSupermarketsFromCity('doesNotExist', newSupermercadosList),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid supermarket', async () => {
    const newSupermercadosList = [
      {
        id: 'doesNotExist',
        nombre: randomSupermarketName({ min: 11 }),
        longitud: faker.location.longitude(),
        latitud: faker.location.latitude(),
        paginaWeb: faker.internet.url(),
        ciudades: [],
      },
    ];

    await expect(() =>
      service.updateSupermarketsFromCity(ciudad.id, newSupermercadosList),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        `El supermercado con el id doesNotExist no existe.`,
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('deleteSupermarketFromCity should remove a supermarket from a city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];

    await service.deleteSupermarketFromCity(ciudad.id, supermercado.id);

    const storedCiudad: CiudadEntity = await ciudadRepository.findOne({
      where: { id: ciudad.id },
      relations: ['supermercados'],
    });
    const deletedSupermercado: SupermercadoEntity =
      storedCiudad.supermercados.find((a) => a.id === supermercado.id);

    expect(deletedSupermercado).toBeUndefined();
  });

  it('deleteSupermarketFromCity should throw an exception for an invalid city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];

    await expect(() =>
      service.deleteSupermarketFromCity('doesNotExist', supermercado.id),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('deleteSupermarketFromCity should throw an exception for an invalid supermarket', async () => {
    await expect(() =>
      service.deleteSupermarketFromCity(ciudad.id, 'doesNotExist'),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('deleteSupermarketFromCity should throw an exception for a supermarket that is not asociated to the city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];

    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.location.city(),
      pais: faker.helpers.arrayElement(PAISES_VALIDOS),
      habitantes: faker.number.int({ min: 10, max: 10000000 }),
    });

    await expect(() =>
      service.deleteSupermarketFromCity(newCiudad.id, supermercado.id),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'El supermercado no pertenece a la ciudad con el id dado.',
        BusinessError.PRECONDITION_FAILED,
      ),
    );
  });
});
