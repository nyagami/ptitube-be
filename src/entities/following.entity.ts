import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class FollowingEnity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.following)
  followed: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.followers)
  follower: UserEntity;
}
