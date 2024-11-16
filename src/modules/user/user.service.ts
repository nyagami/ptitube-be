import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowingEnity, ProfileEntity, UserEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { SignUpDto } from '../auth/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,

    @InjectRepository(FollowingEnity)
    private followingRepository: Repository<FollowingEnity>,
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

  async follow(fromUserId: number, toUserId: number) {
    if (fromUserId === toUserId) return;
    const toUser = await this.userRepository.findOneBy({ id: toUserId });
    if (!toUser) {
      throw new BadRequestException('User does not exist');
    }
    const existedFollowing = await this.followingRepository.findOneBy({
      followed: { id: toUserId },
      follower: { id: fromUserId },
    });
    if (existedFollowing) {
      return this.followingRepository.update(
        { id: existedFollowing.id },
        {
          isFollowing: true,
        },
      );
    } else {
      const following = await this.followingRepository.create({
        follower: { id: fromUserId },
        followed: toUser,
        isFollowing: true,
      });
      return this.followingRepository.insert(following);
    }
  }

  async unfollow(fromUserId: number, toUserId: number) {
    if (fromUserId === toUserId) return;
    const following = await this.followingRepository.findOneBy({
      followed: { id: toUserId },
      follower: { id: fromUserId },
    });
    if (following) {
      return this.followingRepository.update(
        { id: following.id },
        { isFollowing: false },
      );
    }
  }
}
