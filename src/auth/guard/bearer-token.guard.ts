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
    protected readonly reflector: Reflector,
    protected readonly usersService: UsersService,
    protected readonly authService: AuthService,
  ) {}

  protected isBrowserRequest(req: Request): boolean {
    return !!req.headers.referer;
  }

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

    // 모바일의 경우 Bearer 토큰을 확인합니다
    if (!this.isBrowserRequest(req)) {
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
    }

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly usersService: UsersService,
    protected readonly authService: AuthService,
  ) {
    super(reflector, usersService, authService);
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    await super.canActivate(ctx);

    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
      token: string;
      tokenType: jwtPayload['type'];
      isRoutePublic?: boolean;
      headers: {
        'xsrf-token': string;
      };
    };

    // isRoutePublic이 true면 토큰 검증을 수행하지 않습니다.
    if (req.isRoutePublic) {
      return true;
    }

    // 브라우저 요청의 경우 쿠키를 검증합니다
    if (this.isBrowserRequest(req)) {
      // GET을 제외한 요청은 XSRF 토큰을 추가로 검증
      if (req.method !== 'GET') {
        const xsrfToken = req.headers['xsrf-token'];
        await this.authService.verifyToken(xsrfToken);
      }

      const accessToken = req.cookies['accessToken'];
      if (!accessToken) {
        throw new UnauthorizedException('accessToken이 없습니다.');
      }

      const payload = await this.authService.verifyToken(accessToken);
      const user = await this.usersService.getUserByEmail(payload.email);

      req.user = user;
    } else {
      if (req.tokenType !== 'accessToken') {
        throw new UnauthorizedException('accessToken을 확인할 수 없습니다');
      }
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
      isRoutePublic: boolean;
    };

    if (req.isRoutePublic) {
      return true;
    }

    // 브라우저의 경우 쿠키를 검증합니다
    if (this.isBrowserRequest(req)) {
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) {
        throw new UnauthorizedException('refreshToken이 없습니다.');
      }
    } else {
      // 모바일의 경우 Bearer Header를 검증합니다
      if (req.tokenType !== 'refreshToken') {
        throw new UnauthorizedException('refreshToken을 확인할 수 없습니다.');
      }
    }

    return true;
  }
}
