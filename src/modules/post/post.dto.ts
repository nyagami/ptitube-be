import { ApiProperty } from '@nestjs/swagger';

export class UploadPostDto {
  @ApiProperty({ default: 'title' })
  title?: string;

  @ApiProperty({ default: 'description' })
  description?: string;

  @ApiProperty({ type: 'file' })
  thumbnail?: Express.Multer.File;

  @ApiProperty({ type: 'file' })
  video?: Express.Multer.File;
}

export class GetPostListDto {
  @ApiProperty({ default: 0 })
  page: number;
}
