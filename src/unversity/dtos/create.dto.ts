import { IsString } from 'class-validator'

export default class CreateUniversityDTO {
    @IsString()
    name: string;
}