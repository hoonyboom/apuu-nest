import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService, jwtPayload } from '../auth.service';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
      token: string;
      tokenType: jwtPayload['type'];
      isRoutePublic?: boolean;
    };

    if (isPublic) {
      req.isRoutePublic = true;
      return true;
    }

    const rawToken = req.headers['authorization'];
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    const token = this.authService.extractTokenFromHeader(rawToken);
    const payload = await this.authService.verifyToken(token);
    const user = await this.usersService.getUserByEmail(payload.email);

    req.user = user;
    req.token = token;
    req.tokenType = payload.type;

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
      isRoutePublic?: boolean;
    };

    if (req.isRoutePublic) {
      return true;
    }

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
