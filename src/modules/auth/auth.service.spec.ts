import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { addHours, subHours } from 'date-fns';
import { Model } from 'mongoose';

import UserService from '@modules/user/user.service';

import User from '../user/user.schema';
import Auth, { AuthDocument } from './auth.schema';
import AuthService from './auth.service';
import Token, { TokenDocument } from './token.schema';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let authModel: Model<AuthDocument>;
  let tokenModel: Model<TokenDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        JwtService,
        ConfigService,
        {
          provide: getModelToken(Auth.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Token.name),
          useValue: Model,
        },
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);

    authModel = module.get<Model<AuthDocument>>(getModelToken(Auth.name));
    tokenModel = module.get<Model<TokenDocument>>(getModelToken(Token.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userService).toBeDefined();
    expect(authModel).toBeDefined();
    expect(tokenModel).toBeDefined();
  });

  it('deverá lançar uma exceção de usuário não existente ao validar as credenciais', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(null);

    const call = service.validateCredentials({
      email: '',
      password: '',
    });

    await expect(call).rejects.toThrow(
      new HttpException(
        { message: 'Usuário não encontrado' },
        HttpStatus.NOT_FOUND,
      ),
    );
  });

  it('deverá lançar uma exceção de dados de autenticação não existente ao validar as credenciais', async () => {
    jest.spyOn<any, any>(userService, 'findByEmail').mockResolvedValueOnce({});
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce(null);

    const call = service.validateCredentials({
      email: '',
      password: '',
    });

    await expect(call).rejects.toThrow(
      new HttpException(
        { message: 'Dados de autenticação não encontrados' },
        HttpStatus.NOT_FOUND,
      ),
    );
  });

  it('deverá lançar uma exceção de senha incorreta ao validar as credenciais', async () => {
    jest.spyOn<any, any>(userService, 'findByEmail').mockResolvedValueOnce({});
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce({
      salt: '$2b$10$y4jApOIhIUoWIJJe1d0ON.',
      hash: 'hash',
    });

    const call = service.validateCredentials({
      email: '',
      password: '',
    });

    await expect(call).rejects.toThrow(
      new HttpException(
        { message: 'Senha incorreta' },
        HttpStatus.UNAUTHORIZED,
      ),
    );
  });

  it('deverá lançar uma exceção de dados de autenticação não encontrados ao validar as credenciais', async () => {
    jest.spyOn<any, any>(userService, 'findByEmail').mockResolvedValueOnce({});
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce({
      salt: '$2b$10$y4jApOIhIUoWIJJe1d0ON.',
      hash: '$2b$10$y4jApOIhIUoWIJJe1d0ON.PSSQw.kx1m2L3TGCGOS4wX8FEms/SKu',
    });
    jest
      .spyOn<any, any>(authModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce(null);

    const call = service.validateCredentials({
      email: '',
      password: '',
    });

    await expect(call).rejects.toThrow(
      new HttpException(
        {
          message: 'Dados de autenticação não encontrados',
        },
        HttpStatus.NOT_FOUND,
      ),
    );
  });

  it('deve validar as credenciais do usuário', async () => {
    jest.spyOn<any, any>(userService, 'findByEmail').mockResolvedValueOnce({});
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce({
      salt: '$2b$10$y4jApOIhIUoWIJJe1d0ON.',
      hash: '$2b$10$y4jApOIhIUoWIJJe1d0ON.PSSQw.kx1m2L3TGCGOS4wX8FEms/SKu',
    });
    jest
      .spyOn<any, any>(authModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce({});

    const call = service.validateCredentials({
      email: '',
      password: '',
    });

    await expect(call).resolves.not.toThrowError();
  });

  it('deve gerar um novo token de alteração de senha', async () => {
    jest
      .spyOn<any, any>(userService, 'findByEmail')
      .mockResolvedValueOnce({ firstName: '', lastName: '' });

    jest.spyOn<any, any>(tokenModel, 'findOne').mockResolvedValueOnce(null);
    jest
      .spyOn<any, any>(tokenModel, 'create')
      .mockResolvedValueOnce({ token: '' });

    const call = service.requestResetPasswordToken('');

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({
      token: '',
      name: ' ',
    });
  });

  it('deve gerar um novo token a partir de um existente baseado na data de reenvio do mesmo', async () => {
    jest
      .spyOn<any, any>(userService, 'findByEmail')
      .mockResolvedValueOnce({ firstName: '', lastName: '' });

    jest.spyOn<any, any>(tokenModel, 'findOne').mockResolvedValueOnce({
      resendDate: subHours(new Date(), 10).toISOString(),
    });

    jest
      .spyOn<any, any>(tokenModel, 'findByIdAndDelete')
      .mockResolvedValueOnce(null);

    jest
      .spyOn<any, any>(tokenModel, 'create')
      .mockResolvedValueOnce({ token: '' });

    const call = service.requestResetPasswordToken('');

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual({
      token: '',
    });
  });

  it('deve lançar uma exceção dizendo que o token gerado anteriormente ainda é válido e deverá ser utilizado', async () => {
    jest
      .spyOn<any, any>(userService, 'findByEmail')
      .mockResolvedValueOnce({ firstName: '', lastName: '' });

    jest.spyOn<any, any>(tokenModel, 'findOne').mockResolvedValueOnce({
      resendDate: addHours(new Date(), 10).toISOString(),
    });

    jest
      .spyOn<any, any>(tokenModel, 'findByIdAndDelete')
      .mockResolvedValueOnce(null);

    jest
      .spyOn<any, any>(tokenModel, 'create')
      .mockResolvedValueOnce({ token: '' });

    const call = service.requestResetPasswordToken('');

    await expect(call).rejects.toThrow(HttpException);
  });

  it('deve lançar uma exceção de token não encontrado ao alterar a senha', async () => {
    jest.spyOn<any, any>(userService, 'findByEmail').mockResolvedValueOnce({});
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce({
      salt: '$2b$10$y4jApOIhIUoWIJJe1d0ON.',
      hash: '$2b$10$y4jApOIhIUoWIJJe1d0ON.PSSQw.kx1m2L3TGCGOS4wX8FEms/SKu',
    });
    jest
      .spyOn<any, any>(authModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce({});

    jest.spyOn<any, any>(tokenModel, 'findOne').mockResolvedValueOnce(null);

    const call = service.changePassword({
      email: '',
      currentPassword: '',
      newPassword: '',
      token: '',
    });

    await expect(call).rejects.toThrow(
      new HttpException(
        { message: 'Token não encontrado' },
        HttpStatus.NOT_FOUND,
      ),
    );
  });

  it('deve lançar uma exceção de token expirado ao alterar a senha do usuário', async () => {
    jest.spyOn<any, any>(userService, 'findByEmail').mockResolvedValueOnce({
      firstName: '',
      lastName: '',
    });
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce({
      salt: '$2b$10$y4jApOIhIUoWIJJe1d0ON.',
      hash: '$2b$10$y4jApOIhIUoWIJJe1d0ON.PSSQw.kx1m2L3TGCGOS4wX8FEms/SKu',
    });
    jest
      .spyOn<any, any>(authModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce({});
    jest
      .spyOn<any, any>(authModel, 'findOneAndUpdate')
      .mockResolvedValueOnce({});

    jest.spyOn<any, any>(tokenModel, 'findOne').mockResolvedValueOnce({
      expDate: subHours(new Date(), 1).toISOString(),
    });

    const call = service.changePassword({
      email: '',
      currentPassword: '',
      newPassword: '',
      token: '',
    });

    await expect(call).rejects.toThrow(
      new HttpException({ message: 'Token expirado' }, HttpStatus.BAD_REQUEST),
    );
  });

  it('deve alterar a senha do usuário', async () => {
    jest.spyOn<any, any>(userService, 'findByEmail').mockResolvedValueOnce({
      firstName: '',
      lastName: '',
    });
    jest.spyOn<any, any>(authModel, 'findOne').mockResolvedValueOnce({
      salt: '$2b$10$y4jApOIhIUoWIJJe1d0ON.',
      hash: '$2b$10$y4jApOIhIUoWIJJe1d0ON.PSSQw.kx1m2L3TGCGOS4wX8FEms/SKu',
    });
    jest
      .spyOn<any, any>(authModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce({});
    jest
      .spyOn<any, any>(authModel, 'findOneAndUpdate')
      .mockResolvedValueOnce({});

    jest.spyOn<any, any>(tokenModel, 'findOne').mockResolvedValueOnce({
      expDate: addHours(new Date(), 1).toISOString(),
    });

    jest
      .spyOn<any, any>(tokenModel, 'findByIdAndDelete')
      .mockResolvedValueOnce({});

    jest
      .spyOn<any, any>(authModel, 'findOneAndUpdate')
      .mockResolvedValueOnce({});

    const call = service.changePassword({
      currentPassword: '',
      email: '',
      newPassword: '',
      token: '',
    });

    await expect(call).resolves.not.toThrowError();
    await expect(call).resolves.toEqual(' ');
  });
});
