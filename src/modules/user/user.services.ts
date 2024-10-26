import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity, UserEntity } from 'src/entities';
import { saveFile } from 'src/utils/fileUtils';
import { Repository } from 'typeorm';
import { SignUpDto } from '../auth/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
  ) {}

  async findOne(email: string) {
    return this.userRepository.findOneBy({ email });
  }
  async get(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: { profile: true },
    });
  }

  async createUser(
    body: SignUpDto,
    avatar?: Express.Multer.File,
    cover?: Express.Multer.File,
  ) {
    const profile = await this.createProfile(body.displayName, avatar, cover);
    const user = await this.userRepository.create({
      email: body.email,
      password: body.password,
      profile,
      isActivated: false,
    });
    await this.userRepository.insert(user);
    return user;
  }

  async createProfile(
    displayName: string,
    avatar?: Express.Multer.File,
    cover?: Express.Multer.File,
  ) {
    let avatarPath = '';
    if (avatar) {
      avatarPath = await saveFile(`avatar-${displayName}`, avatar);
    }
    let coverPath = '';
    if (cover) {
      coverPath = await saveFile(`cover-${displayName}`, cover);
    }
    const profile = await this.profileRepository.create({
      displayName,
      avatarPath,
      coverPath,
    });
    await this.profileRepository.insert(profile);
    return profile;
  }

  activateUser(email: string) {
    return this.userRepository.update(
      { email },
      {
        isActivated: true,
      },
    );
  }
}
