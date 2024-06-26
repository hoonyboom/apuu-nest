import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { UsersModel } from 'src/users/entity/users.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class RegisterInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}
  async intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const res = ctx.switchToHttp().getResponse() satisfies Response;

    return next.handle().pipe(
      map((user: UsersModel) => {
        if (user) {
          const { accessToken, refreshToken } =
            this.authService.loginUser(user);

          res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });

          return user;
        }
      }),
    );
  }
}
