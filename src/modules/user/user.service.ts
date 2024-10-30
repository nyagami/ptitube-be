import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity, UserEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { SignUpDto } from '../auth/auth.dto';
import { join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';

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
      isActivated: true,
    });
    await this.userRepository.insert(user);
    return user;
  }

  async createProfile(
    displayName: string,
    avatar?: Express.Multer.File,
    cover?: Express.Multer.File,
  ) {
    let avatarPath = undefined;
    if (avatar) {
      avatarPath = avatar.destination.slice(1) + '/' + avatar.filename;
    }
    let coverPath = undefined;
    if (cover) {
      coverPath = cover.destination.slice(1) + '/' + cover.filename;
    }
    const profile = await this.profileRepository.create({
      displayName,
      avatarPath,
      coverPath,
    });
    await this.profileRepository.insert(profile);
    return profile;
  }

  async updateProfile(
    userId: number,
    displayName?: string,
    avatar?: Express.Multer.File,
    cover?: Express.Multer.File,
  ) {
    let avatarPath = undefined;
    if (avatar) {
      avatarPath = avatar.destination.slice(1) + '/' + avatar.filename;
    }
    let coverPath = undefined;
    if (cover) {
      coverPath = cover.destination.slice(1) + '/' + cover.filename;
    }
    return this.profileRepository.update(
      { id: userId },
      {
        displayName: displayName || undefined,
        avatarPath: avatarPath,
        coverPath: coverPath,
      },
    );
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
