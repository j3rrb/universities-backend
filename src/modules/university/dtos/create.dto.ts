import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsAllDomains, IsAllUrl } from 'src/decorators/validations.decorator';

export default class CreateUniversityDTO {
  @ApiProperty({
    description: 'Nome da universidade',
    example: 'Universidade',
  })
  @IsNotEmpty({ message: 'O campo name não pode ser vazio' })
  @IsString({ message: 'O campo name deve ser do tipo string' })
  name: string;

  @ApiProperty({
    description: 'Lista de domínios da universidade, seguindo o RegEx abaixo',
    isArray: true,
    example: ['universidade.com'],
    pattern:
      '/([a-z0-9A-Z].)*[a-z0-9-]+.([a-z0-9]{2,24})+(.co.([a-z0-9]{2,24})|.([a-z0-9]{2,24}))*/g',
  })
  @IsArray({ message: 'O campo domains deve ser uma lista' })
  @IsAllDomains({
    message: 'O campo domains deve ser uma lista de domínios válidos',
  })
  domains: string[];

  @ApiProperty({
    description:
      'País onde a universidade está localizada (não precisa ser necessariamente em inglês)',
    example: 'Brazil',
  })
  @IsNotEmpty({ message: 'O campo country não pode ser vazio' })
  @IsString({ message: 'O campo country deve ser do tipo string' })
  country: string;

  @ApiProperty({
    description: 'Sigla do páis onde a universidade está localizada',
    example: 'BR',
  })
  @IsNotEmpty({ message: 'O campo alpha_two_code não pode ser vazio' })
  @IsString({ message: 'O campo alpha_two_code deve ser do tipo string' })
  @MaxLength(2, {
    message: 'O campo alpha_two_code deve conter no máximo 2 caracteres',
  })
  alpha_two_code: string;

  @ApiProperty({
    description: 'Nome do estado/província onde fica a universidade se houver',
    example: 'Paraná',
  })
  @IsOptional()
  @IsString({ message: 'O campo state-province deve ser do tipo string' })
  'state-province': string | null;

  @ApiProperty({
    description: 'Lista das URLs da universidade, seguindo o RegEx abaixo',
    example: ['www.universidade.com'],
    isArray: true,
    pattern:
      '/[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g',
  })
  @IsArray({ message: 'O campo web_pages deve ser uma lista' })
  @IsAllUrl({ message: 'O campo web_pages deve ser uma lista de URLs válidas' })
  web_pages: string[];
}
