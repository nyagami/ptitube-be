import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  GetPostListDto,
  SearchPostDto,
  UpdatePostDto,
  UploadPostDto,
} from './post.dto';
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
    files: { thumbnail?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Request() req,
  ) {
    console.log(files.thumbnail, files.video);
    if (!files.thumbnail?.[0] && files.video?.[0]) {
      throw new BadRequestException('missing files');
    }
    const userId = req.user.id;
    return this.postService.uploadPost(
      uploadPostDto,
      files.thumbnail[0],
      files.video[0],
      userId,
    );
  }

  @Get('list')
  getPostList(@Query() getPostListDto: GetPostListDto) {
    return this.postService.getPostList(Number(getPostListDto.page));
  }

  @ApiConsumes('multipart/form-data')
  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'thumbnail', maxCount: 1 }],
      postStorageOptions,
    ),
  )
  updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File[] },
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.postService.updatePost(
      userId,
      updatePostDto,
      files.thumbnail?.[0],
    );
  }

  @Get('search')
  searchPost(@Query() searchPostDto: SearchPostDto) {
    return this.postService.searchPost(
      Number(searchPostDto.page),
      searchPostDto.keyword,
    );
  }
}
