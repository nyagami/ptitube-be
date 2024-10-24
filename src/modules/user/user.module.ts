import { Module } from '@nestjs/common';
import { UserService } from './user.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
