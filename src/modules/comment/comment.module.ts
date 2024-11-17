import { Module } from '@nestjs/common';
import { CommentSerivce } from './comment.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CommentEntity,
  NotificationEntity,
  PostEntity,
  ReplyEntity,
  UserEntity,
} from 'src/entities';
import { CommentController } from './comment.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      CommentEntity,
      ReplyEntity,
      NotificationEntity,
    ]),
  ],
  providers: [CommentSerivce],
  controllers: [CommentController],
})
export class CommentModule {}
