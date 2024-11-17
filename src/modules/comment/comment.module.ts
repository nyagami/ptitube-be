import { Module } from '@nestjs/common';
import { CommentSerivce } from './comment.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CommentEntity,
  PostEntity,
  ReplyEntity,
  UserEntity,
} from 'src/entities';
import { CommentController } from './comment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      CommentEntity,
      ReplyEntity,
    ]),
  ],
  providers: [CommentSerivce],
  controllers: [CommentController],
})
export class CommentModule {}
