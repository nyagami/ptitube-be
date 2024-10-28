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
      {
        storage: {
          destination: function (_, file, cb) {
            if (file.fieldname === 'video') {
              cb(null, './static/post/video');
            } else {
              cb(null, './static/post/thumbnail');
            }
          },
          filename: (_, file, cb) => {
            cb(null, `/${uuid()}${extname(file.originalname)}`);
          },
        },
      },
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
