import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, SignUpVerifyDto } from './auth.dto';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @ApiConsumes('multipart/form-data')
  @Post('sign-up')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  signUp(
    @Body() signUpDto: SignUpDto,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File; cover?: Express.Multer.File },
  ) {
    return this.authService.signUp(
      signUpDto,
      files.avatar?.[0],
      files.cover?.[0],
    );
  }

  @Post('verify')
  verify(@Body() verifyDto: SignUpVerifyDto) {
    return this.authService.verifySignUp(verifyDto.token);
  }
}
