import {
  Body,
  Get,
  Param,
  Post,
  Query,
  Request,
  Controller,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  CreateCommentDto,
  CreateReplyDto,
  GetCommentListDto,
  GetCommentReplyListDto,
  UpdateCommentDto,
  UpdateReplyDto,
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

  @Get('detail/:id')
  detailComment(@Param('id') id: number) {
    return this.commentService.getCommentDetail(Number(id));
  }

  @Patch('/:id')
  updateComment(
    @Param('id') id: number,
    @Body() dto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentService.updateComment(
      req.user.id,
      Number(id),
      dto.content,
    );
  }

  @Delete('/:id')
  deleteComment(@Param('id') id: number, @Request() req) {
    return this.commentService.deleteComment(req.user.id, Number(id));
  }

  @Patch('/reply/:id')
  updateReply(
    @Param('id') id: number,
    @Body() dto: UpdateReplyDto,
    @Request() req,
  ) {
    return this.commentService.updateReply(
      req.user.id,
      Number(id),
      dto.content,
    );
  }

  @Delete('/reply/:id')
  deleteReply(@Param('id') id: number, @Request() req) {
    return this.commentService.deleteReply(req.user.id, Number(id));
  }
}
