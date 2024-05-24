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
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostPaginateDTO } from './dto/paginate-post.dto';
import { UpdatePostDTO } from './dto/updatePost.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // @Get()
  // getAllPosts() {
  //   return this.postsService.getAllPosts();
  // }

  @Get()
  async paginatePosts(@Query() dto: PostPaginateDTO) {
    return await this.postsService.paginatePosts(dto);
  }

  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.getPostById(postId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async postNewPost(@User('id') authorId: number, @Body() body: CreatePostDTO) {
    return await this.postsService.createPost(authorId, body);
  }

  @Patch(':id')
  async patchPost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: UpdatePostDTO,
  ) {
    return await this.postsService.updatePost(postId, body);
  }

  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) postId: number) {
    return await this.postsService.deletePost(postId);
  }
}
