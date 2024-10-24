import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity()
export class VideoEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => PostEntity, (post) => post.videos)
  post: PostEntity;

  @Column()
  url: string;

  @Column()
  resolution: string;

  @Column()
  name: string;

  @Column()
  type: string;
}
