import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty()
  token: string;
}
