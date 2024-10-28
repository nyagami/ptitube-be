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
import { UserService } from './user.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './user.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

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
      {
        storage: diskStorage({
          destination: './static/user',
          filename: (_, file, cb) => {
            cb(null, `${uuid()}${extname(file.originalname)}`);
          },
        }),
      },
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
}
