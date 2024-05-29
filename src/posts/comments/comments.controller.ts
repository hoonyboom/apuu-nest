import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IsPublic } from 'src/auth/decorator/is-public.decorator';
import { QR } from 'src/common/decorator/query-runner.decorator';
import { QueryRunnerInterceotor } from 'src/common/interceptor/query-runner.interceptor';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { QueryRunner } from 'typeorm';
import { PostsService } from '../posts.service';
import { CommentsService } from './comments.service';
import { CommentPaginateDTO } from './dto/comment-paginate.dto';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { UpdateCommentDTO } from './dto/update-comment.dto';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';

@Controller('posts/:pid/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @IsPublic()
  async getComments(
    @Query() dto: CommentPaginateDTO,
    @Param('pid', ParseIntPipe) postId: number,
  ) {
    return await this.commentsService.paginateComments(dto, postId);
  }

  @Get(':cid')
  @IsPublic()
  async getComment(@Param('cid', ParseIntPipe) commentId: number) {
    return await this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseInterceptors(QueryRunnerInterceotor)
  async postComment(
    @Body() dto: CreateCommentDTO,
    @Param('pid', ParseIntPipe) postId: number,
    @User() author: UsersModel,
    @QR() qr: QueryRunner,
  ) {
    const res = await this.commentsService.createComment(
      dto,
      author,
      postId,
      qr,
    );
    await this.postsService.updateCommentsCount('inc', postId, qr);

    return res;
  }

  @Patch(':cid')
  @UseGuards(IsCommentMineOrAdminGuard)
  @UseInterceptors(QueryRunnerInterceotor)
  async patchComment(
    @Param('cid', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDTO,
    @QR() qr: QueryRunner,
  ) {
    return await this.commentsService.updateComment(dto, commentId, qr);
  }

  @Delete(':cid')
  @UseGuards(IsCommentMineOrAdminGuard)
  @UseInterceptors(QueryRunnerInterceotor)
  async deleteComment(
    @Param('cid', ParseIntPipe) commentId: number,
    @Param('pid', ParseIntPipe) postId: number,
    @QR() qr: QueryRunner,
  ) {
    const res = await this.commentsService.deleteComment(commentId, qr);
    await this.postsService.updateCommentsCount('dec', postId, qr);

    return res;
  }
}
