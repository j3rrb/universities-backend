import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export default class ForgotPasswordDTO {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsNotEmpty({ message: 'O campo email não pode ser vazio' })
  @IsEmail(undefined, { message: 'O campo email deve ser um e-mail válido' })
  email: string;
}
