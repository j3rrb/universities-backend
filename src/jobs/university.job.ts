import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UniversityService } from '@modules/university/unversity.service';

@Injectable()
export class UniversityJob {
  constructor(private readonly universityService: UniversityService) {}

  @Cron(CronExpression.EVERY_DAY_AT_5AM, {
    timeZone: process.env.CRON_TZ || 'America/Sao_Paulo',
  })
  async populateUniversitiesCollectionDaily() {
    await this.universityService.getUniversitiesDaily();
  }
}
