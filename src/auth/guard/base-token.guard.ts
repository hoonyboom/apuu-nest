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
import { AuthService } from '../auth.service';

@Injectable()
export class BaseTokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      isRoutePublic?: boolean;
    };

    const { referer, host } = req.headers;
    if (referer && !referer.includes(host)) {
      throw new UnauthorizedException('referer가 다릅니다.');
    }

    if (isPublic) {
      req.isRoutePublic = true;
    }

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BaseTokenGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    reflector: Reflector,
  ) {
    super(reflector);
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    await super.canActivate(ctx);

    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
      isRoutePublic?: boolean;
    };

    if (req.isRoutePublic) {
      return true;
    }

    const accessToken = req.cookies['accessToken'];
    if (!accessToken) {
      throw new UnauthorizedException('accessToken이 없습니다.');
    }

    const payload = await this.authService.verifyToken(accessToken);
    const user = await this.usersService.getUserByEmail(payload.email);

    req.user = user;

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends BaseTokenGuard {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    await super.canActivate(ctx);

    const req = ctx.switchToHttp().getRequest() satisfies Request;

    if (!req.cookies['refreshToken']) {
      throw new UnauthorizedException('refreshToken이 없습니다.');
    }

    return true;
  }
}
