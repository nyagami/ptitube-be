import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  GetNotificationListDto,
  SendNotificationDto,
} from './notification.dto';

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

  @Get('list')
  getNotificationList(
    @Query() getNotificationListDto: GetNotificationListDto,
    @Request() req,
  ) {
    return this.notificationSerivce.list(
      Number(req.user.id),
      Number(getNotificationListDto.page),
    );
  }

  @Get('unread')
  getUnreadCount(@Request() req) {
    return this.notificationSerivce.countUnread(req.user.id);
  }

  @Post('read/:id')
  readNotification(@Param('id') id: number, @Request() req) {
    return this.notificationSerivce.read(req.user.id, Number(id));
  }

  @Post('read-all')
  readAll(@Request() req) {
    return this.notificationSerivce.readAll(req.user.id);
  }
}
