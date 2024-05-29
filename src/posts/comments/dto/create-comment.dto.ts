import { PickType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entity/comment.entity';

export class CreateCommentDTO extends PickType(CommentsModel, ['content']) {}
