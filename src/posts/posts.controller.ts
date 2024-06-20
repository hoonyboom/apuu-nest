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
import { QR } from 'src/common/decorator/query-runner.decorator';
import { ImageModelType } from 'src/common/entities/image.entity';
import { QueryRunnerInterceotor as QueryRunnerInterceptor } from 'src/common/interceptor/query-runner.interceptor';
import { User } from 'src/users/decorator/user.decorator';
import { QueryRunner } from 'typeorm';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostPaginateDTO } from './dto/paginate-post.dto';
import { UpdatePostDTO } from './dto/updatePost.dto';
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard';
import { PostsImagesService } from './images/images.service';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postImagesService: PostsImagesService,
  ) {}

  @Get()
  @IsPublic()
  async paginatePosts(@Query() dto: PostPaginateDTO) {
    return await this.postsService.paginatePosts(dto);
  }

  @Get(':pid')
  @IsPublic()
  getPostById(@Param('pid', ParseIntPipe) postId: number) {
    return this.postsService.getPost(postId);
  }

  @Post()
  @UseInterceptors(QueryRunnerInterceptor)
  async postNewPost(
    @User('id') authorId: number,
    @Body() body: CreatePostDTO,
    @QR() qr: QueryRunner,
  ) {
    const { data: post } = await this.postsService.createPost(
      authorId,
      body,
      qr,
    );

    for (let i = 0; i < body.images.length; i++) {
      await this.postImagesService.createPostImage(
        {
          order: i,
          path: body.images[i],
          post: post,
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      );
    }

    return await this.postsService.getPost(post.id, qr);
  }

  @Patch(':pid')
  @UseGuards(IsPostMineOrAdminGuard)
  async patchPost(
    @Param('pid', ParseIntPipe) postId: number,
    @Body() body: UpdatePostDTO,
  ) {
    return await this.postsService.updatePost(postId, body);
  }

  @Delete(':pid')
  @UseGuards(IsPostMineOrAdminGuard)
  async deletePost(@Param('pid', ParseIntPipe) postId: number) {
    return await this.postsService.deletePost(postId);
  }
}
