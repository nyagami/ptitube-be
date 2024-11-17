import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowingEnity, ProfileEntity, UserEntity } from 'src/entities';
import { UserController } from './user.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([UserEntity, ProfileEntity, FollowingEnity]),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
