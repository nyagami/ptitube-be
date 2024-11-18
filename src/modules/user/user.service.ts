import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowingEnity, ProfileEntity, UserEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { SignUpDto } from '../auth/auth.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,

    @InjectRepository(FollowingEnity)
    private followingRepository: Repository<FollowingEnity>,

    private notificationService: NotificationService,
  ) {}

  async findOne(email: string) {
    return this.userRepository.findOneBy({ email });
  }
  async get(id: number, userId: number) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const user = await queryBuilder
      .where('user.id=:id', { id })
      .leftJoinAndSelect('user.profile', 'profile')
      .loadRelationCountAndMap(
        'user.followers',
        'user.followers',
        'followers',
        (qb) => qb.andWhere('followers.isFollowing=1'),
      )
      .loadRelationCountAndMap(
        'user.following',
        'user.following',
        'following',
        (qb) => qb.andWhere('following.isFollowing=1'),
      )
      .addSelect(
        (sub) =>
          sub
            .select('isFollowing')
            .from(FollowingEnity, 'FL')
            .where('FL.followed.id = :id AND FL.follower.id = :userId', {
              id,
              userId,
            }),
        'isFollowed',
      )
      .getOne();
    const following = await this.followingRepository.findOneBy({
      followed: { id },
      follower: { id: userId },
    });

    return { ...user, isFollowed: Boolean(following?.isFollowing) };
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
    const fromUser = await this.userRepository.findOne({
      where: { id: fromUserId },
      relations: { profile: true },
    });
    const toUser = await this.userRepository.findOne({
      where: { id: toUserId },
      relations: { profile: true },
    });
    if (!toUser) {
      throw new BadRequestException('User does not exist');
    }
    const existedFollowing = await this.followingRepository.findOneBy({
      followed: { id: toUserId },
      follower: { id: fromUserId },
    });
    if (existedFollowing) {
      await this.followingRepository.update(
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
      await this.followingRepository.insert(following);
      if (toUser.notificationToken) {
        this.notificationService.sendNotification({
          token: toUser.notificationToken,
          title: 'New follower',
          body: `${fromUser.profile.displayName} has just followed you`,
          imageUrl: process.env.HOST + fromUser.profile.avatarPath,
        });
      }
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
