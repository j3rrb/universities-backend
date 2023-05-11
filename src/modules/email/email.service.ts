import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { compile } from 'handlebars';
import { join, resolve } from 'path';

import { ETemplates } from './interfaces/email.interface';

import SendGrid = require('@sendgrid/mail');
import mjml2html = require('mjml');

@Injectable()
export default class EmailService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_KEY'));
  }

  private logger = new Logger(EmailService.name);

  async sendTemplateEmail(
    email: string,
    subject: string,
    templateName: `${ETemplates}`,
    vars: object,
  ) {
    try {
      const templatePath = resolve(
        join(
          __dirname,
          '../../..',
          'src',
          'modules',
          'email',
          'templates',
          `${templateName}.mjml`,
        ),
      );
      const pathExists = existsSync(templatePath);

      if (!pathExists) {
        throw new Error('O template não existe');
      }

      const fileBuffer = readFileSync(templatePath, { flag: 'r' });
      const template = fileBuffer.toString();

      const parsed = compile(template)(vars);
      const { html } = mjml2html(parsed, { validationLevel: 'strict' });

      await SendGrid.send({
        from: this.configService.get<string>('SENDGRID_FROM'),
        to: email,
        subject,
        html,
      });

      this.logger.debug(
        `E-mail enviado para ${email}. Pode ser que demore um pouco para chegar`,
      );
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail: ${error.message}`);

      throw new Error(error);
    }
  }
}
