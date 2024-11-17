import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ default: 'comment' })
  content: string;

  @ApiProperty({ default: 1 })
  postId: number;
}

export class CreateReplyDto {
  @ApiProperty({ default: 1 })
  commentId: number;

  @ApiProperty({ default: 'reply' })
  content: string;
}

export class GetCommentListDto {
  @ApiProperty({ default: 1 })
  postId: number;

  @ApiProperty({ default: 0 })
  page: number;
}

export class GetCommentReplyListDto {
  @ApiProperty({ default: 0 })
  page: number;

  @ApiProperty({ default: 1 })
  commentId: number;
}
