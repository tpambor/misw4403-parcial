import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { SupermercadoService } from './supermercado.service';
import { SupermercadoEntity } from './supermercado.entity';

describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repository: Repository<SupermercadoEntity>;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repository = module.get<Repository<SupermercadoEntity>>(
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
    repository.clear();
    supermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity = await repository.save({
        nombre: randomSupermarketName({ min: 11 }),
        longitud: faker.location.longitude(),
        latitud: faker.location.latitude(),
        paginaWeb: faker.internet.url(),
      });
      supermercadosList.push(supermercado);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all supermarkets', async () => {
    const supermercados: SupermercadoEntity[] = await service.findAll();

    expect(supermercados).not.toBeNull();
    expect(supermercados).toHaveLength(supermercadosList.length);
  });

  it('findOne should return a supermarket by id', async () => {
    const storedSupermercado: SupermercadoEntity = supermercadosList[0];
    const supermercado: SupermercadoEntity = await service.findOne(
      storedSupermercado.id,
    );

    expect(supermercado).not.toBeNull();
    expect(supermercado.nombre).toEqual(storedSupermercado.nombre);
    expect(supermercado.longitud).toEqual(storedSupermercado.longitud);
    expect(supermercado.latitud).toEqual(storedSupermercado.latitud);
    expect(supermercado.paginaWeb).toEqual(storedSupermercado.paginaWeb);
  });

  it('findOne should throw an exception for an invalid supermarket', async () => {
    await expect(() => service.findOne('doesNotExist')).rejects.toMatchObject(
      new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('create should return a new supermarket', async () => {
    const supermercado: SupermercadoEntity = {
      id: '',
      nombre: randomSupermarketName({ min: 11 }),
      longitud: faker.location.longitude(),
      latitud: faker.location.latitude(),
      paginaWeb: faker.internet.url(),
      ciudades: [],
    };

    const newSupermercado: SupermercadoEntity =
      await service.create(supermercado);
    expect(newSupermercado).not.toBeNull();

    const storedSupermercado: SupermercadoEntity = await repository.findOne({
      where: { id: newSupermercado.id },
    });

    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.id).toEqual(newSupermercado.id);
    expect(storedSupermercado.nombre).toEqual(newSupermercado.nombre);
    expect(storedSupermercado.longitud).toEqual(newSupermercado.longitud);
    expect(storedSupermercado.latitud).toEqual(newSupermercado.latitud);
    expect(storedSupermercado.paginaWeb).toEqual(newSupermercado.paginaWeb);
    expect(newSupermercado.nombre).toEqual(supermercado.nombre);
    expect(newSupermercado.longitud).toEqual(supermercado.longitud);
    expect(newSupermercado.latitud).toEqual(supermercado.latitud);
    expect(newSupermercado.paginaWeb).toEqual(supermercado.paginaWeb);
  });

  it("create should throw a exception if the supermarket's name does not have more than 10 characters", async () => {
    const supermercado: SupermercadoEntity = {
      id: '',
      nombre: randomSupermarketName({ max: 10 }),
      longitud: faker.location.longitude(),
      latitud: faker.location.latitude(),
      paginaWeb: faker.internet.url(),
      ciudades: [],
    };

    await expect(() => service.create(supermercado)).rejects.toMatchObject(
      new BusinessLogicException(
        'El nombre del supermercado debe tener al menos 11 caracteres.',
        BusinessError.PRECONDITION_FAILED,
      ),
    );
  });

  it('update should modify a supermarket', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.paginaWeb = faker.internet.url();

    const updatedSupermercado: SupermercadoEntity = await service.update(
      supermercado.id,
      supermercado,
    );
    expect(updatedSupermercado).not.toBeNull();

    const storedSupermercado: SupermercadoEntity = await repository.findOne({
      where: { id: supermercado.id },
    });

    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.paginaWeb).toEqual(supermercado.paginaWeb);
  });

  it('update should throw an exception for an invalid supermarket', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.paginaWeb = faker.internet.url();

    await expect(() =>
      service.update('doesNotExist', supermercado),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it("update should throw an exception if the supermarket's name does not have more than 10 characters", async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.nombre = randomSupermarketName({ max: 10 });

    await expect(() =>
      service.update(supermercado.id, supermercado),
    ).rejects.toMatchObject(
      new BusinessLogicException(
        'El nombre del supermercado debe tener al menos 11 caracteres.',
        BusinessError.PRECONDITION_FAILED,
      ),
    );
  });

  it('delete should remove a supermarket', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);

    const deletedSupermercado: SupermercadoEntity = await repository.findOne({
      where: { id: supermercado.id },
    });
    expect(deletedSupermercado).toBeNull();
  });

  it('delete should throw an exception for an invalid supermarket', async () => {
    await expect(() => service.delete('doesNotExist')).rejects.toMatchObject(
      new BusinessLogicException(
        'El supermercado con el id dado no existe.',
        BusinessError.NOT_FOUND,
      ),
    );
  });
});
