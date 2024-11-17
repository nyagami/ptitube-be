import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CommentEntity,
  FollowingEnity,
  NotificationEntity,
  PostEntity,
  ProfileEntity,
  ReplyEntity,
  UserEntity,
  VideoEntity,
} from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './core/guards/auth.guard';
import { PostModule } from './modules/post/post.module';
import { PostLikeEntity } from './entities/post.entity';
import { CommentModule } from './modules/comment/comment.module';
import * as admin from 'firebase-admin/app';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    envModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        UserEntity,
        ProfileEntity,
        FollowingEnity,
        PostEntity,
        PostLikeEntity,
        VideoEntity,
        CommentEntity,
        ReplyEntity,
        NotificationEntity,
      ],
      synchronize: true,
      migrations: ['src/database/migrations/*.ts'],
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_SERVICE,
        secure: true,
        port: 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static',
    }),
    AuthModule,
    PostModule,
    CommentModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {
  constructor() {
    const credentialFile = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    admin.initializeApp({
      credential: admin.cert(credentialFile),
    });
  }
}
