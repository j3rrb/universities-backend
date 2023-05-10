import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export default class CreateUserDTO {
  @ApiProperty({
    description: 'Primeiro nome do usuário',
  })
  @IsNotEmpty({ message: 'O campo firstName não pode ser vazio' })
  @IsString({ message: 'O campo firstName deve ser do tipo string' })
  firstName: string;

  @ApiProperty({
    description: 'Último nome do usuário',
  })
  @IsNotEmpty({ message: 'O campo lastName não pode ser vazio' })
  @IsString({ message: 'O campo lastName deve ser do tipo string' })
  lastName: string;

  @ApiProperty({
    description: 'E-mail do usuário',
  })
  @IsNotEmpty({ message: 'O campo email não pode ser vazio' })
  @IsEmail(undefined, { message: 'O campo email deve ser um e-mail válido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
  })
  @IsNotEmpty({ message: 'O campo password não pode ser vazio' })
  @IsString({ message: 'O campo password deve ser do tipo string' })
  @MinLength(8, {
    message: 'O campo password deve conter no mínimo 8 caracteres',
  })
  password: string;
}
