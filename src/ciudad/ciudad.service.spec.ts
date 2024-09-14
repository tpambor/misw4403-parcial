import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { CiudadService } from './ciudad.service';
import { CiudadEntity } from './ciudad.entity';

const PAISES_VALIDOS = ['Argentina', 'Ecuador', 'Paraguay'];
const PAISES_INVALIDOS = ['Chile', 'Uruguay', 'Venezuela', 'Colombia'];

describe('CiudadService', () => {
  let service: CiudadService;
  let repository: Repository<CiudadEntity>;
  let ciudadesList: CiudadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repository = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    ciudadesList = [];
    for (let i = 0; i < 5; i++) {
      const ciudad: CiudadEntity = await repository.save({
        nombre: faker.location.city(),
        pais: faker.helpers.arrayElement(PAISES_VALIDOS),
        habitantes: faker.number.int({ min: 10, max: 10000000 }),
      });
      ciudadesList.push(ciudad);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all cities', async () => {
    const ciudades: CiudadEntity[] = await service.findAll();

    expect(ciudades).not.toBeNull();
    expect(ciudades).toHaveLength(ciudadesList.length);
  });

  it('findOne should return a city by id', async () => {
    const storedCiudad: CiudadEntity = ciudadesList[0];
    const ciudad: CiudadEntity = await service.findOne(storedCiudad.id);

    expect(ciudad).not.toBeNull();
    expect(ciudad.nombre).toEqual(storedCiudad.nombre);
    expect(ciudad.pais).toEqual(storedCiudad.pais);
    expect(ciudad.habitantes).toEqual(storedCiudad.habitantes);
  });

  it('findOne should throw an exception for an invalid city', async () => {
    await expect(() => service.findOne('doesNotExist')).rejects.toMatchObject(
      new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('create should return a new city', async () => {
    const ciudad: CiudadEntity = {
      id: '',
      nombre: faker.location.city(),
      pais: faker.helpers.arrayElement(PAISES_VALIDOS),
      habitantes: faker.number.int({ min: 10, max: 10000000 }),
      supermercados: [],
    };

    const newCiudad: CiudadEntity = await service.create(ciudad);
    expect(newCiudad).not.toBeNull();

    const storedCiudad: CiudadEntity = await repository.findOne({
      where: { id: newCiudad.id },
    });

    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.id).toEqual(newCiudad.id);
    expect(storedCiudad.nombre).toEqual(newCiudad.nombre);
    expect(storedCiudad.pais).toEqual(newCiudad.pais);
    expect(storedCiudad.habitantes).toEqual(newCiudad.habitantes);
    expect(newCiudad.nombre).toEqual(ciudad.nombre);
    expect(newCiudad.pais).toEqual(ciudad.pais);
    expect(newCiudad.habitantes).toEqual(ciudad.habitantes);
  });

  it('create should throw a exception if the country is not valid', async () => {
    const ciudad: CiudadEntity = {
      id: '',
      nombre: faker.location.city(),
      pais: faker.helpers.arrayElement(PAISES_INVALIDOS),
      habitantes: faker.number.int({ min: 10, max: 10000000 }),
      supermercados: [],
    };

    await expect(() => service.create(ciudad)).rejects.toMatchObject(
      new BusinessLogicException(
        'El país de la ciudad no es válido.',
        BusinessError.PRECONDITION_FAILED,
      ),
    );
  });

  it('update should modify a city', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.habitantes = faker.number.int({ min: 10, max: 10000000 });

    const updatedCiudad: CiudadEntity = await service.update(ciudad.id, ciudad);
    expect(updatedCiudad).not.toBeNull();

    const storedCiudad: CiudadEntity = await repository.findOne({
      where: { id: ciudad.id },
    });

    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.habitantes).toEqual(ciudad.habitantes);
  });

  it('update should throw an exception for an invalid city', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.habitantes = faker.number.int({ min: 10, max: 10000000 });

    await expect(() =>
      service.update('doesNotExist', ciudad),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('update should throw an exception for an invalid country', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.pais = faker.helpers.arrayElement(PAISES_INVALIDOS);

    await expect(() => service.update(ciudad.id, ciudad)).rejects.toMatchObject(
      new BusinessLogicException(
        'El país de la ciudad no es válido.',
        BusinessError.PRECONDITION_FAILED,
      ),
    );
  });

  it('delete should remove a city', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);

    const deletedCiudad: CiudadEntity = await repository.findOne({
      where: { id: ciudad.id },
    });
    expect(deletedCiudad).toBeNull();
  });

  it('delete should throw an exception for an invalid city', async () => {
    await expect(() => service.delete('doesNotExist')).rejects.toMatchObject(
      new BusinessLogicException(
        'La ciudad con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });
});
