import { Module } from '@nestjs/common';
import { PostService } from './post.services';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FollowingEnity,
  NotificationEntity,
  PostEntity,
  UserEntity,
  VideoEntity,
} from 'src/entities';
import { PostLikeEntity } from 'src/entities/post.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      VideoEntity,
      PostLikeEntity,
      FollowingEnity,
      NotificationEntity,
    ]),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
