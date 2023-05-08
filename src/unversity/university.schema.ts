import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export default class University {
  @Prop({ required: true })
  name: string;
}

export type UniversityDocument = HydratedDocument<University>;

export const UniversitySchema = SchemaFactory.createForClass(University);
