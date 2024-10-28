import {
  Body,
  Controller,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadPostDto } from './post.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { postStorageOptions } from 'src/core/file/file.storage.options';

@ApiTags('Post')
@Controller('post')
export class PostController {
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      postStorageOptions,
    ),
  )
  uploadPost(
    @Body() uploadPostDto: UploadPostDto,
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File; video?: Express.Multer.File },
    @Request() req,
  ) {}
}
function uuid() {
  throw new Error('Function not implemented.');
}
