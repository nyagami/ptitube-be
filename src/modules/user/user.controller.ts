import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './user.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { profileStorageOptions } from 'src/core/file/file.storage.options';

@ApiTags('User')
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
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      profileStorageOptions,
    ),
  )
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Request() req,
  ) {
    const user = req.user;
    return this.userService.updateProfile(
      user.id,
      updateProfileDto.displayName,
      files.avatar?.[0],
      files.cover?.[0],
    );
  }

  @Post('follow/:id')
  follow(@Param('id') id: number, @Request() req) {
    return this.userService.follow(Number(id), Number(req.user.id));
  }

  @Post('unfollow/:id')
  unfollow(@Param('id') id: number, @Request() req) {
    return this.userService.unfollow(Number(id), Number(req.user.id));
  }
}
