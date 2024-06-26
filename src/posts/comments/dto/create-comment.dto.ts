import { PickType } from '@nestjs/swagger';
import { CommentsModel } from '../entity/comment.entity';

export class CreateCommentDTO extends PickType(CommentsModel, ['content']) {}
