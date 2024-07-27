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
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/auth/decorator/is-public.decorator';
import { CommonService } from 'src/common/common.service';
import { QR } from 'src/common/decorator/query-runner.decorator';
import { QueryRunnerInterceptor } from 'src/common/interceptor/query-runner.interceptor';
import { User } from 'src/users/decorator/user.decorator';
import { QueryRunner } from 'typeorm';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostPaginateDTO } from './dto/paginate-post.dto';
import { UpdatePostDTO } from './dto/updatePost.dto';
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commonService: CommonService,
  ) {}

  @Get()
  @IsPublic()
  async paginatePosts(@Query() dto: PostPaginateDTO) {
    return await this.postsService.paginatePosts(dto);
  }

  @Get(':pid')
  @IsPublic()
  getPostById(@Param('pid', ParseIntPipe) postId: number) {
    return this.postsService.getPostbyId(postId);
  }

  @Post()
  @UseInterceptors(QueryRunnerInterceptor)
  async postNewPost(
    @User('id') authorId: number,
    @Body() body: CreatePostDTO,
    @QR() qr: QueryRunner,
  ) {
    const post = await this.postsService.createPost(authorId, body, qr);
    return await this.postsService.getPostbyId(post.id, qr);
  }

  @Patch(':pid')
  @UseInterceptors(QueryRunnerInterceptor)
  @UseGuards(IsPostMineOrAdminGuard)
  async patchPost(
    @Param('pid', ParseIntPipe) postId: number,
    @Body() body: UpdatePostDTO,
    @QR() qr: QueryRunner,
  ) {
    const post = await this.postsService.updatePost(postId, body, qr);
    return await this.postsService.getPostbyId(postId, qr);
  }

  @Delete(':pid')
  @UseGuards(IsPostMineOrAdminGuard)
  async deletePost(@Param('pid', ParseIntPipe) postId: number) {
    return await this.postsService.deletePost(postId);
  }
}
