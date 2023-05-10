import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import User from '@modules/user/user.schema';

@Schema({ versionKey: false, autoIndex: true, collection: 'auth' })
export default class Auth {
  @Prop({
    required: true,
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  })
  user: User;

  @Prop({ required: true, type: String })
  hash: string;

  @Prop({ required: true, type: String })
  salt: string;

  @Prop({ type: String })
  lastAccess: string;
}

export type AuthDocument = HydratedDocument<Auth>;

export const AuthSchema = SchemaFactory.createForClass(Auth);
