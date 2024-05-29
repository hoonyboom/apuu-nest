import { UsersModel } from 'src/users/entity/users.entity';
import { FindManyOptions } from 'typeorm';

export const DEFAULT_POST_FIND_OPTIONS: FindManyOptions<UsersModel> = {
  relations: ['author', 'images'],
};
