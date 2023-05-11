import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import UniversityConsumer from '@queues/university.queue';
import { UniversityJob } from 'src/jobs/university.job';

import University, { UniversitySchema } from './university.schema';
import { UniversityController } from './unversity.controller';
import UniversityService from './unversity.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: University.name, schema: UniversitySchema },
    ]),
    BullModule.registerQueue({
      name: 'university',
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          max: +configService.get<number>('CACHE_MAX'),
          ttl: +configService.get<number>('CACHE_TTL'),
        };
      },
    }),
  ],
  controllers: [UniversityController],
  providers: [UniversityService, UniversityJob, UniversityConsumer],
})
export class UniversityModule {}
