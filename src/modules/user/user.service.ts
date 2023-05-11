import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { generatePassword } from 'src/utils/password';

import Auth, { AuthDocument } from '@modules/auth/auth.schema';

import CreateUserDTO from './dtos/create.dto';
import UpdateUserDTO from './dtos/update.dto';
import User, { UserDocument } from './user.schema';

@Injectable()
export default class UserService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private logger = new Logger(UserService.name);

  async create(data: CreateUserDTO) {
    try {
      const userExists = await this.userModel
        .findOne({
          email: data.email,
        })
        .exec();

      const authExists = await this.authModel
        .findOne({
          user: userExists,
        })
        .exec();

      if (userExists && authExists)
        throw new HttpException(
          { message: 'Usuário já existente' },
          HttpStatus.CONFLICT,
        );

      if (userExists && !authExists) {
        const { hash, salt } = await generatePassword(data.password);

        await this.authModel.create({
          hash,
          salt,
          user: userExists,
        });

        return userExists;
      }

      const { hash, salt } = await generatePassword(data.password);

      const createdUser = await this.userModel.create(data);

      await this.authModel.create({
        hash,
        salt,
        user: createdUser,
      });

      return createdUser;
    } catch (error) {
      this.logger.error(`Erro ao criar o usuário: ${error.message}`);

      if (error instanceof HttpException) {
        throw new HttpException({ message: error.message }, error.getStatus());
      }

      throw new HttpException(
        { message: 'Houve um erro ao criar o usuário' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new HttpException(
          { message: 'ID inválido' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userModel.findById(id).exec();

      if (!user) {
        throw new HttpException(
          { message: 'Usuário não encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      return user;
    } catch (error) {
      this.logger.error(`Erro ao buscar o usuário por ID: ${error.message}`);

      throw new HttpException(
        { message: 'Houve um erro ao buscar o usuário' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new HttpException(
          { message: 'Usuário não encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar o usuário por e-mail: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw new HttpException({ message: error.message }, error.getStatus());
      }

      throw new HttpException(
        { message: 'Houve um erro ao buscar o usuário' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateUserDTO) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new HttpException(
          {
            message: 'ID inválido',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const userToUpdate = await this.userModel.findById(id).exec();

      if (!userToUpdate) {
        throw new HttpException(
          {
            message: 'Usuário não encontrado',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const existentUser = await this.userModel
        .findOne({
          email: data.email,
        })
        .exec();

      if (existentUser && existentUser.id !== id) {
        throw new HttpException(
          { message: 'E-mail já utilizado por outro usuário' },
          HttpStatus.CONFLICT,
        );
      } else if (existentUser && existentUser.id === id) {
        return userToUpdate;
      }

      const updated = await this.userModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();

      if (!updated) {
        throw new HttpException(
          {
            message: 'Usuário não encontrado',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return updated;
    } catch (error) {
      this.logger.error(`Erro ao atualizar o usuário: ${error.message}`);

      if (error instanceof HttpException) {
        throw new HttpException({ message: error.message }, error.getStatus());
      }

      throw new HttpException(
        { message: 'Houve um erro ao atualizar o usuário' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const removed = await this.userModel.findByIdAndDelete(id).exec();

      if (!removed) {
        throw new HttpException(
          {
            message: 'Usuário não encontrado',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      this.logger.error(`Erro ao remover o usuário: ${error.message}`);

      throw new HttpException(
        { message: 'Houve um erro ao remover o usuário' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
