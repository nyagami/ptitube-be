import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { VideoEntity } from './video.entity';

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

  @ManyToMany(() => UserEntity)
  likes: UserEntity[];

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
