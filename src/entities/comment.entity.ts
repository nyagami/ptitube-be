import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';
import { ReplyEntity } from './reply.entity';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000 })
  content: string;

  @ManyToOne(() => PostEntity)
  post: PostEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  createdBy: UserEntity;

  @OneToMany(() => ReplyEntity, (reply) => reply.comment)
  replies: ReplyEntity[];
}
