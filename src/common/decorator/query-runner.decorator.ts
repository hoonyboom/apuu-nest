import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { QueryRunner } from 'typeorm';

export const QR = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const { qr } = ctx.switchToHttp().getRequest() satisfies Request & {
    qr: QueryRunner;
  };

  if (!qr) {
    throw new InternalServerErrorException(
      '쿼리러너 인터셉터를 빠트린 것 같습니다',
    );
  }

  return qr;
});
