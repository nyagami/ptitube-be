import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { FollowingEnity } from './following.entity';
import { Exclude } from 'class-transformer';
import { PostLikeEntity } from './post.entity';
import { NotificationEntity } from './notification.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  isActivated: boolean;

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  @JoinColumn()
  profile: ProfileEntity;

  @OneToMany(() => PostLikeEntity, (like) => like.user)
  likes: PostLikeEntity[];

  @OneToMany(() => FollowingEnity, (following) => following.followed)
  followers: FollowingEnity[];

  @OneToMany(() => FollowingEnity, (following) => following.follower)
  following: FollowingEnity[];

  @Exclude()
  @Column({ nullable: true, length: 255 })
  notificationToken?: string;

  @OneToMany(() => NotificationEntity, (notification) => notification.receiver)
  nofications: NotificationEntity[];
}
