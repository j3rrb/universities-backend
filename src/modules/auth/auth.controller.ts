import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { LoginResponse } from 'src/docs/responseSchemas.doc';

import EmailService from '@modules/email/email.service';

import AuthService from './auth.service';
import ChangePasswordDTO from './dtos/changePassword.dto';
import ForgotPasswordDTO from './dtos/forgotPassword.dto';
import LoginDTO from './dtos/login.dto';

@Controller('auth')
@ApiTags('Autenticação')
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Public()
  @Post()
  @HttpCode(202)
  @ApiOperation({
    summary: 'Realiza o login do usuário',
  })
  @ApiOkResponse({
    type: LoginResponse,
  })
  async login(@Body() data: LoginDTO) {
    const token = await this.authService.login(data);

    return { token };
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Solicita a alteração da senha do usuário',
    description:
      'Envia um e-mail contendo o token de autenticação para realizar a alteração posteriormente. O token enviado possui uma validade estipulada nas variáveis de ambiente.',
  })
  async resetPassword(@Body() { email }: ForgotPasswordDTO) {
    const { token, name } = await this.authService.requestResetPasswordToken(
      email,
    );

    await this.emailService.sendTemplateEmail(
      email,
      'Recuperação de senha',
      'recoverPassword',
      {
        token,
        name,
      },
    );

    return {
      message:
        'Foi enviado um e-mail contendo o token de autenticação para a alteração da senha',
    };
  }

  @Public()
  @Post('change-password')
  @ApiOperation({
    summary: 'Altera a senha do usuário',
    description:
      'Altera a senha do usuário a partir do token fornecido pelo endpoint de solicitação de alteração de senha',
  })
  async changePassword(@Body() dto: ChangePasswordDTO) {
    const { email } = dto;

    const name = await this.authService.changePassword(dto);

    await this.emailService.sendTemplateEmail(
      email,
      'Senha alterada',
      'passwordRecovered',
      {
        name,
      },
    );
  }
}
