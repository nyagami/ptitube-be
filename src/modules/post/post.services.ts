import { Injectable } from '@nestjs/common';
import { UploadPostDto } from './post.dto';

@Injectable()
export class PostService {
  private saveVideo() {}
  private saveThumbnail() {}

  uploadPost(
    uploadPostDto: UploadPostDto,
    thumbnail: Express.Multer.File,
    video: Express.Multer.File,
  ) {}
}
