import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersModel } from 'src/users/entity/users.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
    };
    const res = ctx.switchToHttp().getResponse() satisfies Response;
    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    const token = this.authService.extractTokenFromHeader(rawToken);
    const { email, password } = this.authService.decodeBasicToken(token);
    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    const tokens = this.authService.loginUser(user);

    req.user = user;

    this.authService.gererateCookie(res, 'refreshToken', tokens.refreshToken);
    this.authService.gererateCookie(res, 'accessToken', tokens.accessToken);
    this.authService.gererateCookie(res, 'isTokenAlive', true, {
      httpOnly: false,
    });

    return true;
  }
}
