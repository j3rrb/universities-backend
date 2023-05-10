import { BullModule } from '@nestjs/bull';
import { HttpException, HttpStatus, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import axios from 'axios';
import { UNIVERSITIES_API_URL } from 'src/constants';

import { AuthModule } from '@modules/auth/auth.module';

import { UniversityModule } from './modules/university/unversity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          redis: {
            host: configService.get<string>('REDIS_HOST'),
            port: +configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD'),
          },
        };
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        configService.get<string>('DB_URL');

        return {
          uri: configService.get<string>('DB_URL'),
          auth: {
            username: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASS'),
          },
          dbName: configService.get<string>('DB_NAME'),
        };
      },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          ttl: configService.get<number>('THROTTLER_TTL'),
          limit: configService.get<number>('THROTTLER_LIMIT'),
        };
      },
    }),
    UniversityModule,
    AuthModule,
  ],
})
export class AppModule {
  constructor() {
    this.apiHealthCheck();
  }

  private logger = new Logger(AppModule.name);

  async apiHealthCheck(count = 1) {
    const MAX_RETRIES = 5;

    if (count > MAX_RETRIES) {
      throw new HttpException(
        { message: 'O serviço de universidades está offline' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const { status } = await axios.get(UNIVERSITIES_API_URL, {
      method: 'OPTIONS',
    });

    if (status !== 200) {
      this.logger.error(
        `O serviço de universidades não está respondendo! Tentativa ${count} de 5`,
      );
      count++;
      this.apiHealthCheck(count);
    }
  }
}
