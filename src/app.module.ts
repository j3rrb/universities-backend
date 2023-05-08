import { Module } from '@nestjs/common';
import { UniversityModule } from './unversity/unversity.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv'

dotenv.config();

@Module({
  imports: [MongooseModule.forRoot(process.env.DB_URL), UniversityModule],
})
export class AppModule { }
