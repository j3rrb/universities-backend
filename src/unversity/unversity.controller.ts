import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Queue } from 'bull';

import CreateUniversityDTO from './dtos/create.dto';
import { UniversityService } from './unversity.service';
import UpdateUniversityDTO from './dtos/update.dto';

@Controller('University')
export class UniversityController {
  constructor(
    @InjectQueue('university') private readonly universityQueue: Queue,
    private readonly universityService: UniversityService,
  ) {}

  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateUniversityDTO) {
    try {
      await this.universityQueue.add(dto);
    } catch (error) {
      throw new HttpException(
        {
          message: `Houve um erro ao criar a universidade: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const req = await this.universityService.getById(id);

    return req;
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateUniversityDTO) {
    try {
        
    } catch (error) {
        
    }
  }
}
