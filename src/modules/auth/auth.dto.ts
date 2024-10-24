import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    default: 'a@a.com',
  })
  email: string;

  @ApiProperty({
    default: '123',
  })
  password: string;
}
