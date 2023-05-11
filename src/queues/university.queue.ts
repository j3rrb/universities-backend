import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import CreateUniversityDTO from '@modules/university/dtos/create.dto';
import UpdateUniversityDTO from '@modules/university/dtos/update.dto';
import UniversityService from '@modules/university/unversity.service';

@Processor('university')
export default class UniversityConsumer {
  constructor(private readonly universityService: UniversityService) {}

  @Process('create')
  async processCreateUniversity({ data }: Job<CreateUniversityDTO>) {
    const createdUni = await this.universityService.create(data);

    return createdUni;
  }

  @Process('update')
  async processUpdateUniversity({
    data: { dto, id },
  }: Job<{ id: string; dto: UpdateUniversityDTO }>) {
    const updatedUni = await this.universityService.update(id, dto);

    return updatedUni;
  }

  @Process('remove')
  async processRemoveUniversity({ data: id }: Job<string>) {
    await this.universityService.remove(id);
  }

  @Process('get_by_id')
  async processGetUniversityById({ data: id }: Job<string>) {
    const uni = await this.universityService.getById(id);

    return uni;
  }

  @Process('get_all')
  async processGetAllUniversities({
    data: { limit, page, country },
  }: Job<{ country?: string; limit: number; page: number }>) {
    const unis = await this.universityService.getAll(country, limit, page);

    return unis;
  }
}
