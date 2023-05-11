import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthGuard } from 'src/guards/jwt.guard';

import EmailService from '@modules/email/email.service';
import { UserModule } from '@modules/user/user.module';

import AuthController from './auth.controller';
import Auth, { AuthSchema } from './auth.schema';
import AuthService from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import Token, { TokenSchema } from './token.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: configService.get<string>('JWT_EXP') },
          global: true,
        };
      },
    }),
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    UserModule,
  ],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
