import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { PAGE_SIZE } from 'src/core/constants';
import { PageDto } from 'src/core/dto/page.dto';
import { NotificationEntity, UserEntity } from 'src/entities';
import { Repository } from 'typeorm';

interface SingleNotificationRequest {
  token: string;
  title: string;
  body: string;
  imageUrl?: string;
}

interface MultipleNotificationRequest {
  tokens: string[];
  title: string;
  body: string;
  imageUrl?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(NotificationEntity)
    private notificationEntity: Repository<NotificationEntity>,
  ) {}

  async setNotificationToken(token: string, userId: number) {
    await this.userRepository
      .createQueryBuilder()
      .update({ notificationToken: null })
      .where('id <> :id AND notificationToken = :token', { token, id: userId });
    return this.userRepository.update(
      { id: userId },
      { notificationToken: token },
    );
  }

  sendNotification({
    token,
    title,
    body,
    imageUrl,
  }: SingleNotificationRequest) {
    return admin.messaging().send({
      token: token,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
  }

  sendMutipleNotifications({
    tokens,
    title,
    body,
    imageUrl,
  }: MultipleNotificationRequest) {
    return admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body, imageUrl },
    });
  }

  async countUnread(userId: number) {
    return this.notificationEntity.count({
      where: {
        receiver: { id: userId },
      },
    });
  }

  async list(userId: number, page: number) {
    const [notifications, totalItems] =
      await this.notificationEntity.findAndCount({
        where: {
          receiver: { id: userId },
        },
        relations: { actor: true, receiver: true, post: true },
        take: PAGE_SIZE,
        skip: page * PAGE_SIZE,
        order: { createdAt: 'desc' },
      });

    const response: PageDto<NotificationEntity> = {
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
        page,
      },
      data: notifications,
    };

    return response;
  }

  async read(userId: number, notificationId: number) {
    const notification = await this.notificationEntity.findOne({
      where: { id: notificationId },
      relations: {
        receiver: true,
      },
    });

    if (!notification)
      throw new BadRequestException('Notification does not exist');
    if (notification.receiver.id !== userId)
      throw new BadRequestException('Not granted');
    return this.notificationEntity.update(
      { id: notificationId },
      { isRead: true },
    );
  }

  async readAll(userId: number) {
    return this.notificationEntity.update(
      { receiver: { id: userId } },
      { isRead: true },
    );
  }
}
