import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { uniqWith } from 'lodash';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { UNIVERSITIES_API_URL } from 'src/constants';

import CreateUniversityDTO from './dtos/create.dto';
import UpdateUniversityDTO from './dtos/update.dto';
import University from './university.schema';

@Injectable()
export class UniversityService {
  constructor(
    @InjectModel(University.name)
    private readonly universityModel: Model<University>,
  ) {}

  private logger = new Logger(UniversityService.name);

  async getUniversitiesDaily() {
    try {
      const countriesNames = [
        'argentina',
        'brasil',
        'chile',
        'colombia',
        'paraguai',
        'peru',
        'suriname',
        'uruguay',
      ];

      const countriesPromises = countriesNames.map(async (country) => {
        const { data } = await axios.get<University[]>(UNIVERSITIES_API_URL, {
          params: {
            country,
          },
        });

        return data;
      });

      const resolvedPromises = await Promise.all(countriesPromises);
      const flattenedData = await Promise.all(resolvedPromises.flat(2));

      const deduplicated = uniqWith(
        flattenedData,
        (arrVal, othVal) => arrVal.name === othVal.name,
      );

      const existsFilterPromises = deduplicated.map(async (x) => {
        const exists = await this.getByName(x.name);

        if (exists) {
          const doc = await this.universityModel
            .findByIdAndUpdate(
              exists.id,
              {
                ...x,
                updatedAt: new Date().toISOString(),
              },
              { new: true },
            )
            .exec();

          return doc;
        }

        const doc = new this.universityModel(x);

        return doc;
      });

      const data = await Promise.all(existsFilterPromises);

      await this.universityModel.bulkSave(data);

      this.logger.debug('Universidades atualizadas com sucesso!');
    } catch (error) {
      this.logger.error(`Erro ao salvar as universidades: ${error.message}`);

      throw new HttpException(
        { message: 'Houve um erro ao salvar as universidades' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(data: CreateUniversityDTO) {
    try {
      const exists = await this.universityModel.find({
        country: data.country,
        'state-province': data['state-province'],
        name: data.name,
      });

      if (exists.length > 0)
        throw new Error(
          JSON.stringify({
            message: 'Universidade já existe',
            code: HttpStatus.CONFLICT,
          }),
        );

      const createdDoc = new this.universityModel(data);

      return createdDoc.save();
    } catch (error) {
      this.logger.error(`Erro ao criar a universidade: ${error.message}`);

      throw new Error(error.message);
    }
  }

  async getAll(country?: string, limit = 20, page = 1) {
    try {
      const paginationOptions = { skip: limit * page, limit };
      const filters = {
        country: { $regex: new RegExp(`^${country.toLowerCase()}`, 'i') },
      };

      const data = await this.universityModel
        .find(filters, undefined, paginationOptions)
        .select({ _id: 1, name: 1, country: 1, 'state-province': 1 })
        .exec();

      const total = await this.universityModel.count();

      return { data, page, total, limit };
    } catch (error) {
      this.logger.error(`Erro ao buscar as universidades: ${error.message}`);

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao buscar as universidades',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  async getById(id: string) {
    try {
      const doc = await this.universityModel.findById(id).exec();

      return doc;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar a universidade pelo ID: ${error.message}`,
      );

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao buscar a universidade',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  async getByName(name: string) {
    try {
      const data = await this.universityModel
        .findOne({
          name,
        })
        .exec();

      return data;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar a universidade pelo nome: ${error.message}`,
      );

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao buscar a universidade pelo nome',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  async update(id: string, data: UpdateUniversityDTO) {
    try {
      const updated = await this.universityModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();

      return updated;
    } catch (error) {
      this.logger.error(`Erro ao atualizar a universidade: ${error.message}`);

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao atualizar a universidade',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  async remove(id: string) {
    try {
      await this.universityModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.logger.error(`Erro ao remover a universidade: ${error.message}`);

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao remover a universidade',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }
}
