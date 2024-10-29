import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { VideoEntity } from './video.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ length: 500 })
  description: string;

  @Column()
  thumbnailPath: string;

  @OneToMany(() => VideoEntity, (video) => video.post)
  videos: VideoEntity[];

  @Exclude()
  @OneToMany(() => PostLikeEntity, (like) => like.post)
  likes: PostLikeEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  lastPosition: number | null;

  @ManyToOne(() => UserEntity)
  createdBy: UserEntity;
}

@Entity()
@Unique(['post', 'user'])
export class PostLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PostEntity, (post) => post.likes)
  post: PostEntity;

  @ManyToOne(() => UserEntity, (user) => user.likes)
  user: UserEntity;
}
