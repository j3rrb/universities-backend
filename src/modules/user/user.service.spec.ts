import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import Auth, { AuthDocument } from '../auth/auth.schema';
import CreateUserDTO from './dtos/create.dto';
import UpdateUserDTO from './dtos/update.dto';
import User, { UserDocument } from './user.schema';
import UserService from './user.service';

describe('UserService', () => {
  let service: UserService;
  let authModel: Model<AuthDocument>;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(Auth.name),
          useValue: Model,
        },
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    authModel = module.get<Model<AuthDocument>>(getModelToken(Auth.name));
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(authModel).toBeDefined();
    expect(userModel).toBeDefined();
  });

  it('deve lançar uma exceção de usuário e dados de autenticação existentes ao criar um usuário', async () => {
    jest.spyOn<any, any>(userModel, 'findOne').mockResolvedValueOnce({});
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce({});

    const call = service.create({} as CreateUserDTO);

    await expect(call).rejects.toThrow(
      new HttpException(
        { message: 'Usuário já existente' },
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('deve criar os dados de autenticação para um usuário existente', async () => {
    jest.spyOn<any, any>(userModel, 'findOne').mockResolvedValueOnce({});
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn<any, any>(authModel, 'create').mockResolvedValueOnce({});

    const call = service.create({ password: '' } as CreateUserDTO);

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({});
  });

  it('deve criar um novo usuário e seus dados de autenticação', async () => {
    jest.spyOn<any, any>(userModel, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn<any, any>(userModel, 'create').mockImplementationOnce(
      () =>
        new Promise((res, rej) => {
          res({});
        }),
    );
    jest.spyOn<any, any>(authModel, 'create').mockImplementationOnce(
      () =>
        new Promise((res, rej) => {
          res({});
        }),
    );

    const call = service.create({ password: '' } as CreateUserDTO);

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({});
  });

  it('deve lançar uma exceção ao buscar o usuário pelo ID', async () => {
    jest.spyOn<any, any>(userModel, 'findById').mockImplementationOnce(() => {
      throw new Error();
    });

    const call = service.findById('645d140ce402908502939cb4');

    await expect(call).rejects.toThrowError();
  });

  it('não deve lançar uma exceção ao buscar o usuário pelo ID', async () => {
    jest.spyOn<any, any>(userModel, 'findById').mockResolvedValueOnce({});

    const call = service.findById('645d140ce402908502939cb4');

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({});
  });

  it('deve lançar uma exceção ao buscar o usuário pelo e-mail', async () => {
    jest.spyOn<any, any>(userModel, 'findOne').mockImplementationOnce(() => {
      throw new Error();
    });

    const call = service.findByEmail('');

    await expect(call).rejects.toThrowError();
  });

  it('não deve lançar uma exceção ao buscar o usuário pelo e-mail', async () => {
    jest.spyOn<any, any>(userModel, 'findOne').mockResolvedValueOnce({});

    const call = service.findByEmail('');

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({});
  });

  it('deve lançar uma exceção de usuário não encontrado ao atualizar o usuário', async () => {
    jest.spyOn<any, any>(userModel, 'findById').mockResolvedValueOnce(null);

    const call = service.update(
      '645d140ce402908502939cb4',
      {} as UpdateUserDTO,
    );

    await expect(call).rejects.toThrow(
      new HttpException(
        {
          message: 'Usuário não encontrado',
        },
        HttpStatus.NOT_FOUND,
      ),
    );
  });

  it('deve lançar uma exceção de e-mail já utilizado ao atualizar o usuário', async () => {
    jest
      .spyOn(userModel, 'findById')
      .mockResolvedValueOnce({ id: '645d140ce402908502939cb4' });
    jest
      .spyOn(userModel, 'findOne')
      .mockResolvedValueOnce({ id: '645d140ce402908502939cb4' });
    jest
      .spyOn(userModel, 'findOne')
      .mockResolvedValueOnce({ id: '645d140ce402908502939cb3' });

    const call = service.update('645d140ce402908502939cb3', {
      email: 'a',
    } as UpdateUserDTO);

    await expect(call).rejects.toThrow(
      new HttpException(
        { message: 'E-mail já utilizado por outro usuário' },
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('deve lançar uma exceção ao atualizar o usuário', async () => {
    jest
      .spyOn(userModel, 'findOne')
      .mockResolvedValueOnce({ id: '645d140ce402908502939cb4' });
    jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
    jest
      .spyOn<any, any>(userModel, 'findByIdAndUpdate')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const call = service.update('645d140ce402908502939cb4', {
      email: 'a',
    } as UpdateUserDTO);

    await expect(call).rejects.toThrowError();
  });

  it('deve lançar uma exceção ao excluir o usuário', async () => {
    jest
      .spyOn<any, any>(userModel, 'findByIdAndDelete')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const call = service.remove('645d140ce402908502939cb4');

    await expect(call).rejects.toThrowError();
  });

  it('deve excluir o usuário', async () => {
    jest
      .spyOn<any, any>(userModel, 'findByIdAndDelete')
      .mockResolvedValueOnce({});

    const call = service.remove('645d140ce402908502939cb4');

    await expect(call).resolves.not.toThrowError();
  });
});
