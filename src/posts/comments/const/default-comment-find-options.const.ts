import { FindManyOptions } from 'typeorm';
import { CommentsModel } from '../entity/comment.entity';

export const DEFAULT_COMMENT_FIND_OPTIONS = {
  relations: ['author'],
  select: {
    author: {
      id: true,
      nickname: true,
    },
  },
} satisfies FindManyOptions<CommentsModel>;
