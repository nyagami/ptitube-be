import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ default: 'name' })
  displayName: string;

  @ApiProperty({ type: 'file', required: false })
  avatar?: Express.Multer.File;

  @ApiProperty({ type: 'file', required: false })
  cover?: Express.Multer.File;
}
