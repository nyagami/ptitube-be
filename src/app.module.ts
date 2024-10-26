import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CommentEntity,
  FollowingEnity,
  PostEntity,
  ProfileEntity,
  ReplyEntity,
  UserEntity,
  VideoEntity,
} from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ServeStaticModule } from '@nestjs/serve-static';

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
        VideoEntity,
        CommentEntity,
        ReplyEntity,
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
  ],
})
export class AppModule {}
