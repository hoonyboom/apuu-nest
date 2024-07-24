import { PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PostsModel } from '../entity/posts.entity';

export class CreatePostDTO extends PickType(PostsModel, [
  'title',
  'content',
  'deadline',
  'goal',
  'level',
  'method',
  'size',
  'period',
  'sort',
  'style',
]) {
  @IsString({
    each: true,
  })
  images: string[] = [];
}
