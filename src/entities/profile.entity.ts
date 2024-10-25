import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity, (user) => user.profile)
  user: UserEntity;

  @Column()
  displayName: string;

  @Column()
  avatarUrl: string;

  @Column()
  coverUrl: string;
}
