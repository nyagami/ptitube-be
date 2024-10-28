import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, SignUpVerifyDto } from './auth.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthMetadata } from 'src/core/guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @AuthMetadata('Public')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @ApiConsumes('multipart/form-data')
  @Post('sign-up')
  @AuthMetadata('Public')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  signUp(
    @Body() signUpDto: SignUpDto,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    return this.authService.signUp(
      signUpDto,
      files.avatar?.[0],
      files.cover?.[0],
    );
  }

  @Post('verify')
  @AuthMetadata('Public')
  verify(@Body() verifyDto: SignUpVerifyDto) {
    return this.authService.verifySignUp(verifyDto.token);
  }
}
