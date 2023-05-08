import { IsNotEmpty, IsString } from 'class-validator';

export default class UpdateUniversityDTO {
  @IsNotEmpty({ message: 'O campo id não pode ser vazio' })
  @IsString({ message: 'O campo id deve ser do tipo numérico' })
  name: string;
}
