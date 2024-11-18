import { BadRequestException, Injectable } from '@nestjs/common';
import { GetUserPostListDto, UpdatePostDto, UploadPostDto } from './post.dto';
import * as ffmpeg from 'fluent-ffmpeg';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FollowingEnity,
  NotificationEntity,
  PostEntity,
  UserEntity,
  VideoEntity,
} from 'src/entities';
import { ILike, Repository } from 'typeorm';
import { PAGE_SIZE } from 'src/core/constants';
import { PageDto } from 'src/core/dto/page.dto';
import { resolveFileServePath } from 'src/utils/fileUtils';
import { PostLikeEntity } from 'src/entities/post.entity';
import { NotificationAction } from 'src/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,

    @InjectRepository(UserEntity)
    private userRepositoy: Repository<UserEntity>,

    @InjectRepository(VideoEntity)
    private videoRepository: Repository<VideoEntity>,

    @InjectRepository(PostLikeEntity)
    private postLikeRepository: Repository<PostLikeEntity>,

    @InjectRepository(FollowingEnity)
    private followingRepository: Repository<FollowingEnity>,

    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,

    private notificationService: NotificationService,
  ) {}

  private transcodeVideo(inputPath, outputPath, resolution) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec('libx264')
        .size(resolution)
        .on('end', () => {
          console.log(`File has been transcoded to ${resolution}`);
          resolve(null);
        })
        .on('error', (err) => {
          console.error(`Error transcoding file: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  private getVideoMetadata(videoPath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  async uploadPost(
    uploadPostDto: UploadPostDto,
    thumbnail: Express.Multer.File,
    video: Express.Multer.File,
    userId: number,
  ) {
    const user = await this.userRepositoy.findOne({
      where: { id: userId },
      relations: { profile: true },
    });
    const videoMetadata = await this.getVideoMetadata(video.path);

    const post = await this.postRepository.create({
      title: uploadPostDto.title,
      description: uploadPostDto.description,
      thumbnailPath: resolveFileServePath(thumbnail),
      duration: videoMetadata.format.duration,
      likes: [],
      createdBy: user,
    });

    const insertedPost = await this.postRepository.save(post);
    const originalVideo = await this.videoRepository.create({
      path: resolveFileServePath(video),
      post: insertedPost,
      mimeType: video.mimetype,
      filename: video.filename,
      resolution: `${videoMetadata.streams?.[0]?.width}x${videoMetadata.streams?.[0]?.height}`,
    });
    await this.videoRepository.insert(originalVideo);

    const followers = (
      await this.followingRepository.find({
        where: { followed: user },
        relations: { follower: true },
      })
    ).map((following) => following.follower);

    const notifications = followers.map((follower) => ({
      action: NotificationAction.POST,
      post,
      actor: user,
      receiver: follower,
      title: post.title,
    }));
    const notificationEntities =
      this.notificationRepository.create(notifications);

    await this.notificationRepository.insert(notificationEntities);
    return this.notificationService.sendMutipleNotifications({
      tokens: followers
        .filter((follower) => follower.notificationToken)
        .map((follower) => follower.notificationToken),
      title: `${user.profile.displayName} posted a video`,
      body: post.title,
      imageUrl: process.env.HOST + post.thumbnailPath,
    });
  }

  async getPostList(page: number) {
    const [posts, totalItems] = await this.postRepository.findAndCount({
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      relations: { videos: true, createdBy: { profile: true } },
      order: { updatedAt: 'desc' },
    });
    const response: PageDto<PostEntity> = {
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
        page: page,
      },
      data: posts,
    };
    return response;
  }

  async getUserPostList(getUserPostListDto: GetUserPostListDto) {
    const [posts, totalItems] = await this.postRepository.findAndCount({
      take: PAGE_SIZE,
      skip: getUserPostListDto.page * PAGE_SIZE,
      relations: { videos: true, createdBy: { profile: true } },
      order: { updatedAt: 'desc' },
      where: {
        createdBy: { id: getUserPostListDto.userId },
      },
    });

    const response: PageDto<PostEntity> = {
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
        page: getUserPostListDto.page,
      },
      data: posts,
    };
    return response;
  }

  async updatePost(
    userId: number,
    updatePostDto: UpdatePostDto,
    thumbnail?: Express.Multer.File,
  ) {
    const post = await this.postRepository.findOne({
      where: { id: updatePostDto.postId },
      relations: { createdBy: true },
    });
    if (!post) throw new BadRequestException('Post does not exist');
    if (post.createdBy.id !== userId)
      throw new BadRequestException('You can not update this post');

    return this.postRepository.update(
      { id: post.id },
      {
        thumbnailPath: thumbnail ? resolveFileServePath(thumbnail) : undefined,
        title: updatePostDto.title,
        description: updatePostDto.description,
      },
    );
  }

  async searchPost(page: number, keyword: string) {
    const [posts, totalItems] = await this.postRepository.findAndCount({
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      where: [
        { title: ILike(`%${keyword}%`) },
        { description: ILike(`%${keyword}%`) },
        {
          createdBy: {
            profile: { displayName: ILike(`%${keyword}%`) },
          },
        },
      ],
      relations: { videos: true, createdBy: { profile: true } },
      order: { updatedAt: 'desc' },
    });

    const response: PageDto<PostEntity> = {
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
        page: page,
      },
      data: posts,
    };
    return response;
  }

  async getDetail(id: number, userId: number) {
    const queryBuilder = this.postRepository.createQueryBuilder('post');
    const post = await queryBuilder
      .where('post.id = :id', { id })
      .leftJoinAndSelect('post.videos', 'videos')
      .leftJoinAndSelect('post.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.profile', 'profile')
      .loadRelationCountAndMap('post.likes', 'post.likes')
      .getOne();
    const like = await this.postLikeRepository.findOneBy({
      post: { id: post.id },
      user: { id: userId },
    });
    const following = await this.followingRepository.findOneBy({
      followed: { id: post.createdBy.id },
      follower: { id: userId },
    });

    return {
      post: {
        ...post,
        createdBy: {
          ...post.createdBy,
          isFollowed: Boolean(following?.isFollowing),
        },
      },
      isLiked: like != null,
      likes: post.likes,
    };
  }

  async likePost(userId: number, postId: number) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) throw new BadRequestException('Post does not exist');
    const user = await this.userRepositoy.findOneBy({ id: userId });
    const like = this.postLikeRepository.create({ post, user });
    return this.postLikeRepository.insert(like);
  }

  async dislikePost(userId: number, postId: number) {
    return this.postLikeRepository.delete({
      post: { id: postId },
      user: { id: userId },
    });
  }

  async deletePost(userId: number, postId: number) {
    const post = await this.postRepository.findOneBy({
      id: postId,
      createdBy: { id: userId },
    });
    if (!post) throw new BadRequestException('Not granted');

    return this.postRepository.delete({ id: postId });
  }
}
