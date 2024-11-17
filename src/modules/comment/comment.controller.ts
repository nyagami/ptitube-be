import {
  Body,
  Get,
  Param,
  Post,
  Query,
  Request,
  Controller,
} from '@nestjs/common';
import {
  CreateCommentDto,
  CreateReplyDto,
  GetCommentListDto,
  GetCommentReplyListDto,
} from './comment.dto';
import { ApiTags } from '@nestjs/swagger';
import { CommentSerivce } from './comment.services';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentSerivce) {}
  @Post('')
  comment(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentService.createComment(
      Number(createCommentDto.postId),
      req.user.id,
      createCommentDto.content,
    );
  }

  @Post('/reply')
  reply(@Body() createReplyDto: CreateReplyDto, @Request() req) {
    return this.commentService.createReply(
      createReplyDto.commentId,
      req.user.id,
      createReplyDto.content,
    );
  }

  @Get('/list')
  listComment(@Query() getCommentListDto: GetCommentListDto) {
    return this.commentService.getCommentList(getCommentListDto);
  }

  @Get('/reply-list')
  commentDetail(@Query() getCommentReplyListDto: GetCommentReplyListDto) {
    return this.commentService.getReplyList(getCommentReplyListDto);
  }

  @Get('/:id')
  detailComment(@Param('id') id: number) {
    return this.commentService.getCommentDetail(Number(id));
  }
}
