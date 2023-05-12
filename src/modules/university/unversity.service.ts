import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { uniqWith } from 'lodash';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { UNIVERSITIES_API_URL } from 'src/constants';
import { isJSONString } from 'src/utils/validators';

import CreateUniversityDTO from './dtos/create.dto';
import UpdateUniversityDTO from './dtos/update.dto';
import University from './university.schema';

@Injectable()
export default class UniversityService {
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
          const doc = await this.universityModel.findByIdAndUpdate(
            exists.id,
            {
              ...x,
              updatedAt: new Date().toISOString(),
            },
            { new: true },
          );

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

      const createdDoc = await this.universityModel.create(data);

      return createdDoc;
    } catch (error) {
      this.logger.error(`Erro ao criar a universidade: ${error.message}`);

      if (isJSONString(error.message)) {
        const errorObj = JSON.parse(error.message);

        throw new Error(JSON.stringify(errorObj));
      }

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao criar a universidade',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  async getAll(countryName?: string, limit = 20, page = 1) {
    try {
      const filters = countryName
        ? {
            country: {
              $regex: new RegExp('^' + countryName + '$', 'i'),
            },
          }
        : undefined;

      const data = await this.universityModel
        .find(filters)
        .skip(limit * (page - 1))
        .limit(limit)
        .select({ _id: 1, name: 1, country: 1, 'state-province': 1 })
        .exec();

      const total = await this.universityModel.count();

      return { data, page, total, limit };
    } catch (error) {
      this.logger.error(`Erro ao buscar as universidades: ${error.message}`);

      if (isJSONString(error.message)) {
        const errorObj = JSON.parse(error.message);

        throw new Error(JSON.stringify(errorObj));
      }

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao buscar as universidade',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  async getById(id: string) {
    try {
      if (ObjectId.isValid(id)) {
        const doc = await this.universityModel.findById(id);

        if (!doc) {
          throw new Error(
            JSON.stringify({
              message: 'Universidade não encontrada',
              code: HttpStatus.NOT_FOUND,
            }),
          );
        }

        return doc;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'ID inválido',
            code: HttpStatus.BAD_REQUEST,
          }),
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao buscar a universidade pelo ID: ${error.message}`,
      );

      if (isJSONString(error.message)) {
        const errorObj = JSON.parse(error.message);

        throw new Error(JSON.stringify(errorObj));
      }

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
      const data = await this.universityModel.findOne({
        name,
      });

      if (!data) {
        throw new Error(
          JSON.stringify({
            message: 'Universidade não encontrada',
            code: HttpStatus.NOT_FOUND,
          }),
        );
      }

      return data;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar a universidade pelo nome: ${error.message}`,
      );

      if (isJSONString(error.message)) {
        const errorObj = JSON.parse(error.message);

        throw new Error(JSON.stringify(errorObj));
      }

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao buscar a universidade',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  async update(id: string, data: UpdateUniversityDTO) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error(
          JSON.stringify({
            message: 'ID inválido',
            code: HttpStatus.BAD_REQUEST,
          }),
        );
      }

      const updated = await this.universityModel.findByIdAndUpdate(id, data, {
        new: true,
      });

      if (!updated) {
        throw new Error(
          JSON.stringify({
            message: 'Universidade não encontrada',
            code: HttpStatus.NOT_FOUND,
          }),
        );
      }

      return updated;
    } catch (error) {
      this.logger.error(`Erro ao atualizar a universidade: ${error.message}`);

      if (isJSONString(error.message)) {
        const errorObj = JSON.parse(error.message);

        throw new Error(JSON.stringify(errorObj));
      }

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao editar a universidade',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  async remove(id: string) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error(
          JSON.stringify({
            message: 'ID inválido',
            code: HttpStatus.BAD_REQUEST,
          }),
        );
      }

      const removed = await this.universityModel.findByIdAndDelete(id);

      if (!removed) {
        throw new Error(
          JSON.stringify({
            message: 'Universidade não encontrada',
            code: HttpStatus.NOT_FOUND,
          }),
        );
      }
    } catch (error) {
      this.logger.error(`Erro ao remover a universidade: ${error.message}`);

      if (isJSONString(error.message)) {
        throw new Error(error.message);
      }

      throw new Error(
        JSON.stringify({
          message: 'Houve um erro ao remover a universidade',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }
}
