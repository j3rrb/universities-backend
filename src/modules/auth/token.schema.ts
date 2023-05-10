import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import User from '@modules/user/user.schema';

@Schema({ versionKey: false, autoIndex: true, collection: 'token' })
export default class Token {
  @Prop({
    required: true,
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  })
  user: User;

  @Prop({ required: true, type: String })
  token: string;

  @Prop({ required: true, type: String })
  resendDate: string;

  @Prop({ required: true, type: String })
  expDate: string;
}

export type TokenDocument = HydratedDocument<Token>;

export const TokenSchema = SchemaFactory.createForClass(Token);
