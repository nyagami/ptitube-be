import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './notification.dto';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private notificationSerivce: NotificationService) {}

  @Post('token')
  sendNotificationToken(
    @Body() sendNotificationDto: SendNotificationDto,
    @Request() req,
  ) {
    if (req?.user?.id) {
      return this.notificationSerivce.setNotificationToken(
        sendNotificationDto.token,
        Number(req.user.id),
      );
    }
  }
}
