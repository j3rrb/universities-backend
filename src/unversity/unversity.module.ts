import { Module } from '@nestjs/common';
import { UniversityController } from './unversity.controller';
import { UniversityService } from './unversity.service';
import { MongooseModule } from '@nestjs/mongoose';
import University, { UniversitySchema } from './university.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: University.name, schema: UniversitySchema },
    ]),
  ],
  controllers: [UniversityController],
  providers: [UniversityService],
})
export class UniversityModule {}
