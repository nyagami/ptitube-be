import { Module } from '@nestjs/common';
import { PostService } from './post.services';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity, UserEntity, VideoEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, UserEntity, VideoEntity])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
