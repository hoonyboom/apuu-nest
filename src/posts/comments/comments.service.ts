import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { UsersModel } from 'src/users/entity/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CommentPaginateDTO } from './dto/comment-paginate.dto';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { UpdateCommentDTO } from './dto/update-comment.dto';
import { CommentsModel } from './entity/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(CommentsModel)
      : this.commentRepository;
  }

  async paginateComments(dto: CommentPaginateDTO, postId: number) {
    return await this.commonService.paginate({
      dto,
      repo: this.commentRepository,
      path: `posts/${postId}/comments`,
      overrideFindOptions: {
        where: {
          post: { id: postId },
        },
        relations: ['author'],
      },
    });
  }

  async getCommentById(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new BadRequestException('해당 댓글은 존재하지 않습니다');
    }

    return comment;
  }

  async createComment(
    dto: CreateCommentDTO,
    author: UsersModel,
    postId: number,
    qr?: QueryRunner,
  ) {
    const repo = this.getRepository(qr);

    return await repo.save({
      ...dto,
      author,
      post: {
        id: postId,
      },
    });
  }

  async deleteComment(commentId: number, qr?: QueryRunner) {
    const repo = this.getRepository(qr);

    const exists = await repo.exists({ where: { id: commentId } });
    if (!exists) {
      throw new BadRequestException('해당 댓글은 존재하지 않습니다');
    }

    return await repo.delete(commentId);
  }

  async updateComment(
    dto: UpdateCommentDTO,
    commentId: number,
    qr?: QueryRunner,
  ) {
    const repo = this.getRepository(qr);

    const exists = await repo.exists({ where: { id: commentId } });
    if (!exists) {
      throw new BadRequestException('해당 댓글은 존재하지 않습니다');
    }

    return await this.commentRepository.update(commentId, dto);
  }

  async isCommentMine(commentId: number, userId: number) {
    return await this.commentRepository.exists({
      where: { id: commentId, author: { id: userId } },
      relations: ['author'],
    });
  }
}
