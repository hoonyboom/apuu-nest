import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersModel } from 'src/users/entity/users.entity';
import { CommentsService } from '../comments.service';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentService: CommentsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() satisfies Request & {
      user: UsersModel;
    };

    if (!req.user) {
      throw new ForbiddenException('로그인이 필요합니다');
    }

    if (req.user.role === 'admin') {
      return true;
    }

    const commentId = +req.params.cid;
    if (!commentId) {
      throw new ForbiddenException('cid가 path parameter로 제공돼야 합니다');
    }

    const passOk = await this.commentService.isCommentMine(
      commentId,
      req.user.id,
    );

    if (!passOk) {
      throw new ForbiddenException('본인의 댓글만 수정할 수 있습니다');
    }

    return true;
  }
}
