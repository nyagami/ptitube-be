import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
