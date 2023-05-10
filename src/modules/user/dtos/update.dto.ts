import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class UpdateUserDTO {
  @ApiProperty({
    description: 'Primeiro nome do usuário',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'O campo firstName não pode ser vazio' })
  @IsString({ message: 'O campo firstName deve ser do tipo string' })
  firstName?: string;

  @ApiProperty({
    description: 'Último nome do usuário',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'O campo lastName não pode ser vazio' })
  @IsString({ message: 'O campo lastName deve ser do tipo string' })
  lastName?: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'O campo email não pode ser vazio' })
  @IsEmail(undefined, { message: 'O campo email deve ser um e-mail válido' })
  email?: string;
}
