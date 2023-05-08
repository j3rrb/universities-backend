import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import CreateUniversityDTO from '../dtos/create.dto';
import { UniversityService } from '../unversity.service';

@Processor('university')
export default class UniversityProcessor {
  constructor(private readonly universityService: UniversityService) {}

  @Process('create')
  async processCreateUniversity(job: Job<CreateUniversityDTO>) {
    try {
      await this.universityService.create(job.data);
    } catch (error) {
      throw new Error(error);
    }
  }
}
