import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from './user.entity';

@Entity()
export class ReplyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000 })
  content: string;

  @ManyToOne(() => CommentEntity, (comment) => comment.replies)
  comment: CommentEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  createdBy: UserEntity;
}
