import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsAllDomains, IsAllUrl } from 'src/decorators/validations.decorator';

export default class UpdateUniversityDTO {
  @ApiProperty({
    description: 'Nome da universidade',
    example: 'Universidade',
  })
  @IsNotEmpty({ message: 'O campo name não pode ser vazio' })
  @IsString({ message: 'O campo name deve ser do tipo numérico' })
  name: string;

  @ApiProperty({
    description: 'Lista das URLs da universidade, seguindo o RegEx abaixo',
    example: ['www.universidade.com'],
    isArray: true,
    pattern:
      '/[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g',
  })
  @IsNotEmpty({ message: 'O campo web_pages não pode ser vazio' })
  @IsAllUrl({ message: 'O campo web_pages deve ser uma lista de URLs válidas' })
  web_pages: string[];

  @ApiProperty({
    description: 'Lista de domínios da universidade, seguindo o RegEx abaixo',
    isArray: true,
    example: ['universidade.com'],
    pattern:
      '/([a-z0-9A-Z].)*[a-z0-9-]+.([a-z0-9]{2,24})+(.co.([a-z0-9]{2,24})|.([a-z0-9]{2,24}))*/g',
  })
  @IsNotEmpty({ message: 'O campo domains não pode ser vazio' })
  @IsAllDomains({
    message: 'O campo domains deve ser uma lista de domínios válidos',
  })
  domains: string[];
}
