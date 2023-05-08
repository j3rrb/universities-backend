import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import CreateUniversityDTO from './dtos/create.dto';
import University from './university.schema';
import UpdateUniversityDTO from './dtos/update.dto';

@Injectable()
export class UniversityService {
  constructor(
    @InjectModel(University.name)
    private readonly universityModel: Model<University>,
  ) {}

  async create(data: CreateUniversityDTO) {
    try {
      const createdDoc = new this.universityModel(data);

      return createdDoc.save();
    } catch (error) {
      throw new Error(error);
    }
  }

  async getById(id: number) {}

  async update(id: number, data: UpdateUniversityDTO) {}

  async remove() {}
}
