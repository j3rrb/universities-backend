import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';

import EmailService from './email.service';
import { ETemplates } from './interfaces/email.interface';

import SendGrid = require('@sendgrid/mail');

jest.mock('@sendgrid/mail');
jest.mock('handlebars', () => ({
  compile: jest.fn().mockReturnValue(() => ''),
}));
jest.mock('mjml', () => () => ({
  html: jest.fn().mockReturnValue(''),
}));
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('')),
}));

describe('EmailService', () => {
  let service: EmailService;
  let mockFS: jest.Mocked<typeof fs>;
  let mockSG: jest.Mocked<typeof SendGrid>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService, ConfigService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    mockFS = <jest.Mocked<typeof fs>>fs;
    mockSG = <jest.Mocked<typeof SendGrid>>SendGrid;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar uma exceção ao buscar o template do e-mail', async () => {
    mockFS.existsSync.mockReturnValueOnce(false);

    const call = service.sendTemplateEmail('', '', '' as ETemplates, {});

    await expect(call).rejects.toThrowError();
  });

  it('deve lançar uma exceção ao enviar o e-mail', async () => {
    mockFS.existsSync.mockReturnValueOnce(true);
    mockSG.send.mockImplementationOnce(() => {
      throw new Error();
    });

    const call = service.sendTemplateEmail('', '', '' as ETemplates, {});

    await expect(call).rejects.toThrowError();
  });

  it('deve enviar o e-mail', async () => {
    mockFS.existsSync.mockReturnValueOnce(true);
    mockSG.send.mockImplementationOnce(() => null);

    const call = service.sendTemplateEmail('', '', '' as ETemplates, {});

    await expect(call).resolves.not.toThrowError();
  });
});
