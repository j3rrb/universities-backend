import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export default class ChangePasswordDTO {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'email@exemplo.com',
  })
  @IsNotEmpty({ message: 'O campo email não pode ser vazio' })
  @IsEmail(undefined, { message: 'O campo email deve ser um e-mail válido' })
  email: string;

  @ApiProperty({
    description: 'Senha atual do usuário',
    example: 'senha-antiga123',
  })
  @IsNotEmpty({ message: 'O campo currentPassword não pode ser vazio' })
  @IsString({ message: 'O campo currentPassword deve ser do tipo string' })
  @MinLength(8, {
    message: 'O campo currentPassword deve conter no mínimo 8 caracteres',
  })
  currentPassword: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'senha-nova123',
  })
  @IsNotEmpty({ message: 'O campo newPassword não pode ser vazio' })
  @IsString({ message: 'O campo newPassword deve ser do tipo string' })
  @MinLength(8, {
    message: 'O campo newPassword deve conter no mínimo 8 caracteres',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Token de autenticação',
    example: 'XPSRm5QtEEuIxh8mH+xJiWrezQpCea3',
  })
  @IsNotEmpty({ message: 'O campo token não pode ser vazio' })
  @IsString({ message: 'O campo token deve ser do tipo string' })
  token: string;
}
