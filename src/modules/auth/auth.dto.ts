import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    default: 'hoangquan05112002@gmail.com',
  })
  email: string;

  @ApiProperty({
    default: '123123',
  })
  password: string;

  @ApiProperty({
    default: true,
    required: false,
  })
  rememberSignIn?: boolean;
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

export class SignUpVerifyDto {
  @ApiProperty()
  token: string;
}
