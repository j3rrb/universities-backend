import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { UserResponse } from 'src/docs/responseSchemas.doc';

import CreateUserDTO from './dtos/create.dto';
import UpdateUserDTO from './dtos/update.dto';
import UserService from './user.service';

@Controller('users')
@ApiTags('Usuários')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Cria um novo usuário',
  })
  @ApiOkResponse({
    type: UserResponse,
  })
  async create(@Body() dto: CreateUserDTO) {
    const createdUser = await this.userService.create(dto);

    return createdUser;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Edita um usuário existente',
  })
  @ApiOkResponse({
    type: UserResponse,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    const updatedUser = await this.userService.update(id, dto);

    return updatedUser;
  }
}
