import { Module } from '@nestjs/common';
import { PostService } from './post.services';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CommentEntity,
  FollowingEnity,
  PostEntity,
  ReplyEntity,
  UserEntity,
  VideoEntity,
} from 'src/entities';
import { PostLikeEntity } from 'src/entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      VideoEntity,
      PostLikeEntity,
      CommentEntity,
      ReplyEntity,
      FollowingEnity,
    ]),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
