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
import { postStorageOptions } from 'src/core/file/file.storage.options';
import { PostService } from './post.services';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

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
    files: { thumbnail: Express.Multer.File[]; video: Express.Multer.File[] },
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.postService.uploadPost(
      uploadPostDto,
      files.thumbnail[0],
      files.video[0],
      userId,
    );
  }
}
