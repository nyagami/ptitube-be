import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CommentEntity,
  NotificationEntity,
  PostEntity,
  ReplyEntity,
  UserEntity,
} from 'src/entities';
import { Repository } from 'typeorm';
import { GetCommentListDto, GetCommentReplyListDto } from './comment.dto';
import { PageDto } from 'src/core/dto/page.dto';
import { PAGE_SIZE } from 'src/core/constants';
import { NotificationAction } from 'src/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentSerivce {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,

    @InjectRepository(UserEntity)
    private userRepositoy: Repository<UserEntity>,

    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,

    @InjectRepository(ReplyEntity)
    private replyRepository: Repository<ReplyEntity>,

    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,

    private notificationService: NotificationService,
  ) {}

  async createComment(postId: number, userId: number, content: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { createdBy: true },
    });
    if (!post) throw new BadRequestException('Post does not exist');
    const user = await this.userRepositoy.findOne({
      where: { id: userId },
      relations: { profile: true },
    });
    const comment = await this.commentRepository.create({
      post,
      createdBy: user,
      content,
    });

    await this.commentRepository.insert(comment);
    const notification = this.notificationRepository.create({
      title: comment.content.slice(0, 255),
      action: NotificationAction.COMMENT,
      actor: user,
      receiver: post.createdBy,
      post: post,
    });
    await this.notificationRepository.insert(notification);

    return this.notificationService.sendNotification({
      token: post.createdBy.notificationToken,
      title: `${user.profile.displayName} commented`,
      body: comment.content,
      imageUrl: process.env.HOST + post.thumbnailPath,
    });
  }

  async createReply(commentId: number, userId: number, content: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: { createdBy: true, post: true },
    });
    if (!comment) throw new BadRequestException('Comment does not exist');
    const user = await this.userRepositoy.findOne({
      where: { id: userId },
      relations: { profile: true },
    });
    const reply = await this.replyRepository.create({
      comment,
      createdBy: user,
      content,
    });
    this.replyRepository.insert(reply);

    const notification = this.notificationRepository.create({
      title: reply.content.slice(0, 255),
      action: NotificationAction.REPLY,
      actor: user,
      receiver: comment.createdBy,
      post: comment.post,
    });
    await this.notificationRepository.insert(notification);

    return this.notificationService.sendNotification({
      token: comment.createdBy.notificationToken,
      title: `${user.profile.displayName} replied`,
      body: reply.content,
      imageUrl: process.env.HOST + comment.post.thumbnailPath,
    });
  }

  async getCommentDetail(commentId: number) {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment');
    const comment = await queryBuilder
      .where('comment.id = :id', { id: commentId })
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
      .getOne();
    return comment;
  }

  async getCommentList(getCommentListDto: GetCommentListDto) {
    const post = await this.postRepository.findOneBy({
      id: getCommentListDto.postId,
    });
    if (!post) throw new BadRequestException('Post does not exist');

    const queryBuilder = this.commentRepository.createQueryBuilder('comment');
    const [comments, totalItems] = await queryBuilder
      .where('comment.postId = :postId', { postId: getCommentListDto.postId })
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
    const comment = await this.commentRepository.findOneBy({
      id: getCommentReplyListDto.commentId,
    });
    if (!comment) throw new BadRequestException('Post does not exist');
    const [replies, totalItems] = await this.replyRepository.findAndCount({
      where: {
        comment: { id: getCommentReplyListDto.commentId },
      },
      relations: { createdBy: { profile: true } },
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

  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, createdBy: { id: userId } },
    });
    if (!comment) throw new BadRequestException('Comment does not exist');
    return this.commentRepository.update({ id: commentId }, { content });
  }

  async updateReply(userId: number, replyId: number, content) {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId, createdBy: { id: userId } },
    });

    if (!reply) throw new BadRequestException('Reply doesnt not exist');
    return this.replyRepository.update({ id: replyId }, { content });
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, createdBy: { id: userId } },
    });
    if (!comment) throw new BadRequestException('Comment does not exist');
    return this.commentRepository.delete({ id: commentId });
  }

  async deleteReply(userId: number, replyId: number) {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId, createdBy: { id: userId } },
    });

    if (!reply) throw new BadRequestException('Reply doesnt not exist');
    return this.replyRepository.delete({ id: replyId });
  }
}
