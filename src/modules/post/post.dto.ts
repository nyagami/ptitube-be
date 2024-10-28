import { ApiProperty } from '@nestjs/swagger';

export class UploadPostDto {
  @ApiProperty({ default: 'title' })
  title?: string;

  @ApiProperty({ default: 'description' })
  description?: string;

  @ApiProperty({ type: 'file' })
  thumbnail?: Express.Multer.File;

  @ApiProperty({ type: 'video' })
  video?: Express.Multer.File;
}
