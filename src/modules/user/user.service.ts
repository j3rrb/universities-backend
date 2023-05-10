import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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

      const authExists = await this.authModel.findOne({
        user: userExists,
      });

      if (userExists && authExists)
        throw new HttpException(
          { message: 'Usuário já existente' },
          HttpStatus.CONFLICT,
        );

      if (userExists && !authExists) {
        const { hash, salt } = await generatePassword(data.password);

        const authInstance = new this.authModel({
          hash,
          salt,
          user: userExists,
        });

        await authInstance.save();

        return userExists;
      }

      const { hash, salt } = await generatePassword(data.password);

      const userInstance = new this.userModel(data);
      const createdUser = await userInstance.save();

      const authInstance = new this.authModel({
        hash,
        salt,
        user: createdUser,
      });

      await authInstance.save();

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
      const user = await this.userModel.findById(id).exec();

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

      return user;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar o usuário por e-mail: ${error.message}`,
      );

      throw new HttpException(
        { message: 'Houve um erro ao buscar o usuário' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateUserDTO) {
    try {
      const existentUser = await this.userModel.findOne({
        email: data.email,
      });

      if (existentUser && existentUser.id !== id) {
        throw new HttpException(
          { message: 'E-mail já utilizado por outro usuário' },
          HttpStatus.CONFLICT,
        );
      }

      if (existentUser && existentUser.id === id) {
        return existentUser;
      }

      const updated = await this.userModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();

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
      await this.userModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.logger.error(`Erro ao remover o usuário: ${error.message}`);

      throw new HttpException(
        { message: 'Houve um erro ao remover o usuário' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
