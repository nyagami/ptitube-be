import { Module } from '@nestjs/common';
import { PostService } from './post.services';
import { PostController } from './post.controller';

@Module({
  imports: [],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
