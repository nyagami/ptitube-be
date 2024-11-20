import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity()
export class VideoEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => PostEntity, (post) => post.videos)
  post: PostEntity;

  @Column()
  path: string;

  @Column()
  resolution?: string;

  @Column({ default: 720 })
  height: number;

  @Column({ default: 1280 })
  width: number;

  @Column()
  filename: string;

  @Column()
  mimeType: string;
}
