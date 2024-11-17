import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { UserEntity } from 'src/entities';
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
}
