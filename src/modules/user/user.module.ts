import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import Auth, { AuthSchema } from '@modules/auth/auth.schema';

import UserController from './user.controller';
import User, { UserSchema } from './user.schema';
import UserService from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
