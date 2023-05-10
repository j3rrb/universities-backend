import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { addSeconds, differenceInSeconds, format } from 'date-fns';
import { Model } from 'mongoose';
import { generatePassword } from 'src/utils/password';

import User from '@modules/user/user.schema';
import UserService from '@modules/user/user.service';

import Auth from './auth.schema';
import ChangePasswordDTO from './dtos/changePassword.dto';
import ForgotPasswordDTO from './dtos/forgotPassword.dto';
import LoginDTO from './dtos/login.dto';
import Token from './token.schema';

@Injectable()
export default class AuthService {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<Auth>,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private logger = new Logger(AuthService.name);

  private async generateForgotPasswordToken(user: User) {
    const ONE_HOUR_SECS = 3600;
    const FIVE_MIN_SECS = 300;

    const tokenExp =
      +this.configService.get<number>('FORGOT_PASSWORD_TOKEN_EXP_SECS') ||
      ONE_HOUR_SECS;

    const resendExp =
      +this.configService.get<number>(
        'FORGOT_PASSWORD_RESEND_TOKEN_EXP_SECS',
      ) || FIVE_MIN_SECS;

    const hash = randomBytes(64).toString('base64');
    const newToken = new this.tokenModel({
      token: hash,
      expDate: addSeconds(new Date(), tokenExp),
      resendDate: addSeconds(new Date(), resendExp),
      user,
    });

    await newToken.save();

    return newToken.token;
  }

  async login(data: LoginDTO) {
    const validUser = await this.validateCredentials(data);
    const jwtToken = await this.signJwt(validUser);

    return jwtToken;
  }

  async validateCredentials(data: LoginDTO) {
    const { password, email } = data;

    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new HttpException(
          { message: 'Usuário não encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      const authData = await this.authModel.findOne({
        user,
      });

      if (!authData) {
        throw new HttpException(
          { message: 'Dados de autenticação não encontrados' },
          HttpStatus.NOT_FOUND,
        );
      }

      const compareHash = await hash(password, authData.salt);
      const isValid = compareHash === authData.hash;

      if (!isValid) {
        throw new HttpException(
          { message: 'Senha incorreta' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.authModel
        .findByIdAndUpdate(authData, {
          lastAccess: new Date().toISOString(),
        })
        .exec();

      return user;
    } catch (error) {
      this.logger.error(`Erro ao realizar autenticação: ${error.message}`);

      if (error instanceof HttpException) {
        throw new HttpException({ message: error.message }, error.getStatus());
      }

      throw new InternalServerErrorException();
    }
  }

  private async signJwt({ email, firstName, lastName }: User): Promise<string> {
    const token = await this.jwtService.signAsync({
      email,
      firstName,
      lastName,
    });

    return token;
  }

  async requestResetPasswordToken(email: string) {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new HttpException(
          { message: 'Usuário não encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      const token = await this.tokenModel.findOne({
        user,
      });

      if (token) {
        if (Date.now() >= new Date(token.resendDate).getTime()) {
          await this.tokenModel.findByIdAndDelete(token.id).exec();

          const newToken = await this.generateForgotPasswordToken(user);

          return { token: newToken };
        } else {
          const dateDiffSecs = differenceInSeconds(
            new Date(token.resendDate),
            new Date(),
          );

          const resendDate = addSeconds(new Date(), dateDiffSecs);

          throw new HttpException(
            {
              message: `Um token ainda válido já foi enviado por e-mail! O token poderá ser solicitado novamente às ${format(
                resendDate,
                'HH:mm:ss a',
              )}`,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const generatedToken = await this.generateForgotPasswordToken(user);

      return {
        token: generatedToken,
        name: `${user.firstName} ${user.lastName}`,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao gerar o token de recuperação de senha: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw new HttpException({ message: error.message }, error.getStatus());
      }

      throw new HttpException(
        { message: 'Houve um erro ao gerar o token de recuperação de senha' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(dto: ChangePasswordDTO) {
    try {
      const { currentPassword, email, newPassword, token } = dto;

      const validUser = await this.validateCredentials({
        email,
        password: currentPassword,
      });

      const passwordToken = await this.tokenModel.findOne({
        token,
      });

      if (!passwordToken) {
        throw new HttpException(
          { message: 'Token não encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (Date.now() >= new Date(passwordToken.expDate).getTime()) {
        throw new HttpException(
          { message: 'Token expirado' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const { hash, salt } = await generatePassword(newPassword);

      await this.authModel
        .findOneAndUpdate(
          {
            user: validUser,
          },
          { hash, salt },
        )
        .exec();

      await this.tokenModel.findByIdAndDelete(passwordToken).exec();

      return `${validUser.firstName} ${validUser.lastName}`;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar os dados de autenticação: ${error.message}`,
      );

      throw new HttpException(
        { message: 'Houve um erro ao atualizar os dados de autenticação' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
