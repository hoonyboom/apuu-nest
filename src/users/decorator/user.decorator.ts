import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersModel } from '../entity/users.entity';

export const User = createParamDecorator(
  (selector: keyof UsersModel | undefined, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
    };

    if (!user) {
      throw new InternalServerErrorException(
        'User 데코레이터는 AccessTokenGuard와 함께 사용해야 합니다',
      );
    }

    if (selector) {
      return user[selector];
    }

    return user;
  },
);
