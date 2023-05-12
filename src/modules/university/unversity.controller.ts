import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Queue } from 'bull';
import {
  GetAllUniversitiesResponse,
  UniversityResponse,
} from 'src/docs/responseSchemas.doc';

import CreateUniversityDTO from './dtos/create.dto';
import UpdateUniversityDTO from './dtos/update.dto';

@Controller('universities')
@ApiTags('Universidades')
export class UniversityController {
  constructor(
    @InjectQueue('university') private readonly universityQueue: Queue,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cria uma universidade',
  })
  @ApiOkResponse({
    type: UniversityResponse,
  })
  async create(@Body() dto: CreateUniversityDTO) {
    try {
      const createdJob = await this.universityQueue.add('create', dto);
      const finishedJobData = await createdJob.finished();

      return finishedJobData;
    } catch (error) {
      const errorObj = JSON.parse(error.message);

      throw new HttpException(errorObj.message, errorObj.code);
    }
  }

  @Get()
  @ApiQuery({ name: 'country', required: false, example: 'Brazil' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiOperation({
    summary: 'Busca as universidades cadastradas',
  })
  @ApiOkResponse({
    type: GetAllUniversitiesResponse,
  })
  async getAll(
    @Query('country') country?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
  ) {
    try {
      const createdJob = await this.universityQueue.add('get_all', {
        country,
        limit,
        page,
      });
      const finishedJobData = await createdJob.finished();

      return finishedJobData;
    } catch (error) {
      const errorObj = JSON.parse(error.message);

      throw new HttpException(errorObj.message, errorObj.code);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca uma universidade pelo ID',
  })
  @ApiOkResponse({
    type: UniversityResponse,
  })
  async getById(@Param('id') id: string) {
    try {
      const createdJob = await this.universityQueue.add('get_by_id', id);
      const finishedJobData = await createdJob.finished();

      return finishedJobData;
    } catch (error) {
      const errorObj = JSON.parse(error.message);

      throw new HttpException(errorObj.message, errorObj.code);
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Edita uma universidade pelo ID',
  })
  @ApiOkResponse({
    type: UniversityResponse,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUniversityDTO) {
    try {
      const createdJob = await this.universityQueue.add('update', { id, dto });
      const finishedJobData = await createdJob.finished();

      return finishedJobData;
    } catch (error) {
      const errorObj = JSON.parse(error.message);

      throw new HttpException(errorObj.message, errorObj.code);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Exclui uma universidade pelo ID',
  })
  async remove(@Param('id') id: string) {
    try {
      const createdJob = await this.universityQueue.add('remove', id);
      const finishedJobData = await createdJob.finished();

      return finishedJobData;
    } catch (error) {
      const errorObj = JSON.parse(error.message);

      throw new HttpException({ message: errorObj.message }, errorObj.code);
    }
  }
}
