import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
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
    const req = ctx.switchToHttp().getRequest() satisfies Request;

    return next.handle().pipe(
      map((user: UsersModel) => {
        if (user) {
          this.authService.loginUser(req, user);
          return user;
        }
      }),
    );
  }
}
