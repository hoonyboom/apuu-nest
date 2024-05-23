import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService, jwtPayload } from '../auth.service';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
      token: string;
      tokenType: jwtPayload['type'];
    };
    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    const token = this.authService.extractTokenFromHeader(rawToken);
    const verifyToken = await this.authService.verifyToken(token);

    const user = await this.usersService.getUserByEmail(verifyToken.email);

    req.user = user;
    req.token = token;
    req.tokenType = verifyToken.type;

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    await super.canActivate(ctx);

    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
      token: string;
      tokenType: jwtPayload['type'];
    };

    if (req.tokenType !== 'access') {
      throw new UnauthorizedException('accessToken이 아닙니다.');
    }

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    await super.canActivate(ctx);

    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
      token: string;
      tokenType: jwtPayload['type'];
    };

    if (req.tokenType !== 'refresh') {
      throw new UnauthorizedException('refreshToken이 아닙니다.');
    }

    return true;
  }
}
