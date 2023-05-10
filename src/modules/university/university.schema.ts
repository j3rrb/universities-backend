import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ versionKey: false, autoIndex: true, collection: 'university' })
export default class University {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: [String] })
  domains: string[];

  @Prop({ required: true, type: String })
  country: string;

  @Prop({ required: true, type: String })
  alpha_two_code: string;

  @Prop({ required: false, type: String })
  'state-province': string;

  @Prop({ required: true, type: [String] })
  web_pages: string[];

  @Prop({ default: new Date().toISOString() })
  updatedAt: string;
}

export type UniversityDocument = HydratedDocument<University>;

export const UniversitySchema = SchemaFactory.createForClass(University);
