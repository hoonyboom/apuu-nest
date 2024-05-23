import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities/posts.entity';

export class CreatePostDTO extends PickType(PostsModel, ['title', 'content']) {}
