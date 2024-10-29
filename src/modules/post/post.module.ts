import { Module } from '@nestjs/common';
import { PostService } from './post.services';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity, UserEntity, VideoEntity } from 'src/entities';
import { PostLikeEntity } from 'src/entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      VideoEntity,
      PostLikeEntity,
    ]),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
