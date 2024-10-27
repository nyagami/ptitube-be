import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.services';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './user.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('detail/:id')
  get(@Param() params: { id: number }) {
    return this.userService.get(params.id);
  }

  @Get('me')
  getMe(@Request() req) {
    const user = req.user;
    return this.userService.get(user.id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Patch('')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File; cover?: Express.Multer.File },
    @Request() req,
  ) {
    const user = req.user;
    return this.userService.updateProfile(
      user.id,
      updateProfileDto.displayName,
      files.avatar,
      files.cover,
    );
  }
}
