import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  async intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const res = ctx.switchToHttp().getResponse() satisfies Response;

    return next.handle().pipe(
      map((result) => {
        if (result && result.accessToken && result.refreshToken) {
          res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
          res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });

          return { success: true };
        }
      }),
    );
  }
}
