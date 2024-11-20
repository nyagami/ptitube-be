import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  avatarPath: string;

  @Column()
  coverPath: string;
}
