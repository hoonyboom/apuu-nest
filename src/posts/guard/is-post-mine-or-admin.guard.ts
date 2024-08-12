import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { PostsService } from 'src/posts/posts.service';
import { Roles } from 'src/users/const/enum.const';
import { UsersModel } from 'src/users/entity/users.entity';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
    };

    if (!req.user) {
      throw new ForbiddenException('로그인이 필요합니다');
    }

    if (req.user.role === Roles.ADMIN) {
      return true;
    }

    const postId = +req.params.pid;
    if (!postId) {
      throw new BadRequestException('pid가 path parameter로 제공돼야 합니다');
    }

    const passOk = await this.postsService.isPostMine(postId, req.user.id);

    if (!passOk) {
      throw new ForbiddenException('본인의 정보만 수정할 수 있습니다');
    }

    return true;
  }
}
