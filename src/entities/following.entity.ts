import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class FollowingEnity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.followers)
  followed: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.following)
  follower: UserEntity;

  @Column({ nullable: true, type: 'boolean' })
  isFollowing: boolean;
}
