import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';

export enum NotificationAction {
  POST,
  COMMENT,
  REPLY,
}

@Entity()
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  actor: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.nofications)
  receiver: UserEntity;

  @ManyToOne(() => PostEntity)
  post: PostEntity;

  @Column()
  action: NotificationAction;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;
}
