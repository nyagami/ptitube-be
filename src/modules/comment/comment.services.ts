import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CommentEntity,
  PostEntity,
  ReplyEntity,
  UserEntity,
} from 'src/entities';
import { Repository } from 'typeorm';
import { GetCommentListDto, GetCommentReplyListDto } from './comment.dto';
import { PageDto } from 'src/core/dto/page.dto';
import { PAGE_SIZE } from 'src/core/constants';

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
  ) {}

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
    const post = this.postRepository.findOneBy({
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
    const comment = this.commentRepository.findOneBy({
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
}
