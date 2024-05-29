import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from 'src/users/decorator/roles.decorator';
import { UsersModel } from 'src/users/entity/users.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRole) {
      return true;
    }

    const { user } = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
    };

    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다');
    }

    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        `작업을 수행할 권한이 없습니다. ${requiredRole} 권한이 필요합니다`,
      );
    }

    return true;
  }
}
