import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';
import { PostEntity } from 'src/entities';

export class UploadPostDto {
  @IsNotEmpty()
  @ApiProperty({ default: 'title' })
  title?: string;

  @IsNotEmpty()
  @ApiProperty({ default: 'description' })
  description?: string;

  @ApiProperty({ type: 'file' })
  thumbnail?: Express.Multer.File;

  @ApiProperty({ type: 'file' })
  video?: Express.Multer.File;
}

export class GetPostListDto {
  @ApiProperty({ default: 0 })
  page: number;
}

export class UpdatePostDto {
  @ApiProperty({ default: 1 })
  postId: number;

  @ApiProperty({ default: 'new title' })
  title: string;

  @ApiProperty({ default: 'new description' })
  description: string;

  @ApiProperty({ type: 'file', required: false })
  thumbnail?: Express.Multer.File;
}

export class SearchPostDto {
  @ApiProperty({ default: 0 })
  page: number;

  @ApiProperty({ default: '' })
  keyword: string;
}

export class CreateCommentDto {
  @ApiProperty({ default: 'comment' })
  content: string;
}

export class CreateReplyDto {
  @ApiProperty({ default: 1 })
  commentId: number;

  @ApiProperty({ default: 'reply' })
  content: string;
}

export class GetUserPostListDto {
  @ApiProperty({ default: 0 })
  page: number;

  @ApiProperty({ default: 1 })
  userId: number;
}

export class GetCommentListDto {
  @ApiProperty({ default: 0 })
  page: number;
}

export class GetCommentReplyListDto {
  @ApiProperty({ default: 0 })
  page: number;

  @ApiProperty({ default: 1 })
  commentId: number;
}
