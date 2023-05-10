import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export default class LoginDTO {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsNotEmpty({ message: 'O campo login não pode ser vazio' })
  @IsEmail(undefined, { message: 'O campo email deve ser um e-mail válido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha',
  })
  @IsNotEmpty({ message: 'O campo password não pode ser vazio' })
  @IsString({ message: 'O campo password deve ser do tipo string' })
  password: string;
}
