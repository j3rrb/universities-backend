import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { Model } from 'mongoose';

import CreateUniversityDTO from './dtos/create.dto';
import UpdateUniversityDTO from './dtos/update.dto';
import University, { UniversityDocument } from './university.schema';
import UniversityService from './unversity.service';

describe('UniversityService', () => {
  let service: UniversityService;
  let universityModel: Model<UniversityDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversityService,
        {
          provide: getModelToken(University.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<UniversityService>(UniversityService);

    universityModel = module.get<Model<UniversityDocument>>(
      getModelToken(University.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(universityModel).toBeDefined();
  });

  it('deve lançar uma exceção ao popular a collection de universidades', async () => {
    jest.spyOn(axios, 'get').mockImplementationOnce(() => {
      throw new Error();
    });

    const call = service.getUniversitiesDaily();

    await expect(call).rejects.toThrowError();
  });

  it('deve lançar uma exceção ao criar uma universidade', async () => {
    const mock: CreateUniversityDTO = {
      'state-province': '',
      alpha_two_code: '',
      country: '',
      domains: [''],
      name: '',
      web_pages: [''],
    };

    universityModel.find = jest.fn().mockImplementationOnce(() => [0]);

    const call = service.create(mock);

    await expect(call).rejects.toThrow(Error);
  });

  it('não deve lançar uma exceção ao criar uma universidade', async () => {
    const mock: CreateUniversityDTO = {
      'state-province': '',
      alpha_two_code: '',
      country: '',
      domains: [''],
      name: '',
      web_pages: [''],
    };

    universityModel.find = jest.fn().mockImplementationOnce(() => []);

    jest
      .spyOn(universityModel, 'create')
      .mockImplementationOnce(jest.fn().mockResolvedValueOnce({}));

    const call = service.create(mock);

    await expect(call).resolves.not.toThrow(Error);
  });

  it('deve lançar uma exceção ao buscar todas as universidades', async () => {
    jest.spyOn(universityModel, 'find').mockImplementationOnce(() => {
      throw new Error();
    });

    const call = service.getAll();

    await expect(call).rejects.toThrowError();
  });

  it('não deve lançar uma exceção ao buscar todas as universidades', async () => {
    jest
      .spyOn<any, any>(universityModel, 'find')
      .mockImplementationOnce(() => ({
        skip: jest.fn().mockImplementationOnce(() => ({
          limit: jest.fn().mockImplementationOnce(() => ({
            select: jest.fn().mockImplementationOnce(() => ({
              exec: jest.fn().mockReturnValueOnce([]),
            })),
          })),
        })),
      }));

    jest.spyOn(universityModel, 'count').mockResolvedValueOnce(0);

    const call = service.getAll('', 20, 1);

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({
      data: [],
      page: 1,
      total: 0,
      limit: 20,
    });
  });

  it('deve lançar uma exceção ao buscar uma universidade pelo seu ID', async () => {
    jest.spyOn<any, any>(universityModel, 'findById').mockReturnValueOnce(null);

    const call = service.getById('645d140ce402908502939cb4');

    await expect(call).rejects.toThrowError();
  });

  it('não deve lançar uma exceção ao buscar uma universidade pelo seu ID', async () => {
    jest.spyOn<any, any>(universityModel, 'findById').mockResolvedValueOnce({});

    const call = service.getById('645d140ce402908502939cb4');

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({});
  });

  it('deve lançar uma exceção ao buscar uma universidade pelo seu nome', async () => {
    jest
      .spyOn<any, any>(universityModel, 'findOne')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const call = service.getByName('');

    await expect(call).rejects.toThrowError();
  });

  it('não deve lançar uma exceção ao buscar uma universidade pelo seu nome', async () => {
    jest.spyOn<any, any>(universityModel, 'findOne').mockResolvedValueOnce({});

    const call = service.getByName('');

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({});
  });

  it('deve lançar uma exceção ao atualizar a universidade', async () => {
    jest
      .spyOn<any, any>(universityModel, 'findByIdAndUpdate')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const call = service.update('', {} as UpdateUniversityDTO);

    await expect(call).rejects.toThrowError();
  });

  it('deve lançar uma exceção ao excluir a universidade', async () => {
    jest
      .spyOn<any, any>(universityModel, 'findByIdAndDelete')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const call = service.remove('645d140ce402908502939cb4');

    await expect(call).rejects.toThrowError();
  });

  it('não deve lançar uma exceção ao excluir a universidade', async () => {
    jest
      .spyOn<any, any>(universityModel, 'findByIdAndDelete')
      .mockResolvedValueOnce({});

    const call = service.remove('645d140ce402908502939cb4');

    await expect(call).resolves.not.toThrowError();
  });
});
