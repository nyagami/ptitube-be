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
import { ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
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

  @Get('detail/:id')
  @ApiParam({ name: 'id' })
  getDetail(@Param('id') id: number, @Request() req) {
    return this.postService.getDetail(Number(id), req.user.id);
  }

  @Post('detail/:id/like')
  @ApiParam({ name: 'id' })
  likePost(@Param('id') id: number, @Request() req) {
    return this.postService.likePost(req.user.id, id);
  }

  @Post('detail/:id/dislike')
  @ApiParam({ name: 'id' })
  dislikePost(@Param('id') id: number, @Request() req) {
    return this.postService.dislikePost(req.user.id, id);
  }
}
