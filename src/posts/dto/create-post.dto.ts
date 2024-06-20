import { PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PostsModel } from '../entity/posts.entity';

export class CreatePostDTO extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    each: true,
  })
  @IsOptional()
  images?: string[] = [];
}
