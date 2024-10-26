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

export class SignUpDto {
  @ApiProperty({ default: 'a@a.com' })
  email: string;

  @ApiProperty({ default: '123' })
  password: string;

  @ApiProperty({ default: 'name' })
  displayName: string;

  @ApiProperty({ type: 'file', required: false })
  avatar?: Express.Multer.File;

  @ApiProperty({ type: 'file', required: false })
  cover?: Express.Multer.File;
}

export class SignUpVerificationDto {
  @ApiProperty()
  token: string;
}
