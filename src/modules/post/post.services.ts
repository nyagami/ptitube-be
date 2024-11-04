import { BadRequestException, Injectable } from '@nestjs/common';
import {
  GetCommentListDto,
  GetCommentReplyListDto,
  GetUserPostListDto,
  UpdatePostDto,
  UploadPostDto,
} from './post.dto';
import * as ffmpeg from 'fluent-ffmpeg';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CommentEntity,
  PostEntity,
  ReplyEntity,
  UserEntity,
  VideoEntity,
} from 'src/entities';
import { ILike, Repository } from 'typeorm';
import { PAGE_SIZE } from 'src/core/constants';
import { PageDto } from 'src/core/dto/page.dto';
import { resolveFileServePath } from 'src/utils/fileUtils';
import { PostLikeEntity } from 'src/entities/post.entity';

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

    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,

    @InjectRepository(ReplyEntity)
    private replyRepository: Repository<ReplyEntity>,
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
    const user = await this.userRepositoy.findOneBy({ id: userId });
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
    return {
      post: post,
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

  async createComment(postId: number, userId: number, content: string) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) throw new BadRequestException('Post does not exist');
    const user = await this.userRepositoy.findOneBy({ id: userId });
    const comment = await this.commentRepository.create({
      post,
      createdBy: user,
      content,
    });

    return this.commentRepository.insert(comment);
  }

  async createReply(commentId: number, userId: number, content: string) {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) throw new BadRequestException('Comment does not exist');
    const user = await this.userRepositoy.findOneBy({ id: userId });
    const reply = await this.replyRepository.create({
      comment,
      createdBy: user,
      content,
    });
    return this.replyRepository.insert(reply);
  }

  async getCommentList(postId: number, getCommentListDto: GetCommentListDto) {
    const post = this.postRepository.findOneBy({ id: postId });
    if (!post) throw new BadRequestException('Post does not exist');

    const queryBuilder = this.commentRepository.createQueryBuilder('comment');
    const [comments, totalItems] = await queryBuilder
      .where('comment.postId = :postId', { postId })
      .leftJoinAndSelect('comment.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.profile', 'profile')
      .leftJoinAndMapOne(
        'comment.latestReply',
        'comment.replies',
        'latestReply',
      )
      .leftJoinAndSelect('latestReply.createdBy', 'latestReplyCreatedBy')
      .leftJoinAndSelect('latestReplyCreatedBy.profile', 'latestReplyProfile')
      .loadRelationCountAndMap('comment.replies', 'comment.replies')
      .skip(PAGE_SIZE * getCommentListDto.page)
      .take(PAGE_SIZE)
      .getManyAndCount();

    const response: PageDto<CommentEntity> = {
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
        page: getCommentListDto.page,
      },
      data: comments,
    };
    return response;
  }

  async getReplyList(getCommentReplyListDto: GetCommentReplyListDto) {
    const comment = this.commentRepository.findOneBy({
      id: getCommentReplyListDto.commentId,
    });
    if (!comment) throw new BadRequestException('Post does not exist');
    const [replies, totalItems] = await this.replyRepository.findAndCount({
      where: {
        comment: { id: getCommentReplyListDto.commentId },
      },
      skip: PAGE_SIZE * getCommentReplyListDto.page,
      take: PAGE_SIZE,
    });
    const response: PageDto<ReplyEntity> = {
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
        page: getCommentReplyListDto.page,
      },
      data: replies,
    };
    return response;
  }
}
