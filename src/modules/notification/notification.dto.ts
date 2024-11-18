import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty()
  token: string;
}

export class GetNotificationListDto {
  @ApiProperty({ default: 0 })
  page: number;
}
