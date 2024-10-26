import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.services';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './user.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  get(@Param() params: { id: number }) {
    return this.userService.get(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
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
