import { ApiProperty } from '@nestjs/swagger';

import CreateUniversityDTO from '@modules/university/dtos/create.dto';

export class UniversityResponse extends CreateUniversityDTO {
  @ApiProperty({
    example: '645a612189004376c87324da',
  })
  _id: string;

  @ApiProperty({
    example: '2023-05-10T15:31:05.267Z',
  })
  updatedAt: string;
}

export class GetAllUniversitiesResponse {
  @ApiProperty({
    type: [UniversityResponse],
  })
  data: UniversityResponse[];

  @ApiProperty({
    example: 1,
  })
  page: number;

  @ApiProperty({
    example: 100,
  })
  total: number;

  @ApiProperty({
    example: 1,
  })
  limit: number;
}

export class LoginResponse {
  @ApiProperty({
    description: 'Token JWT',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  token: string;
}

export class UserResponse {
  @ApiProperty({
    example: 'Teste',
  })
  firstName: string;

  @ApiProperty({
    example: 'Teste',
  })
  lastName: string;

  @ApiProperty({
    example: 'a@a.com',
  })
  email: string;

  @ApiProperty({
    example: '645acc82cea35e7f64e07e50',
  })
  _id: string;
}
