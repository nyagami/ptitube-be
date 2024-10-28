import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePostDto, UploadPostDto } from './post.dto';
import * as ffmpeg from 'fluent-ffmpeg';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity, UserEntity, VideoEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { PAGE_SIZE } from 'src/core/constants';
import { PageDto } from 'src/core/dto/page.dto';
import { resolveFileServePath } from 'src/utils/fileUtils';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,

    @InjectRepository(UserEntity)
    private userRepositoy: Repository<UserEntity>,

    @InjectRepository(VideoEntity)
    private videoRepository: Repository<VideoEntity>,
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
    const queryBuilder = this.postRepository.createQueryBuilder('post');
    queryBuilder.skip(page * PAGE_SIZE).take(PAGE_SIZE);

    const [posts, totalItems] = await this.postRepository.findAndCount({
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      relations: { videos: true, createdBy: { profile: true } },
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
}
