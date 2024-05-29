import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class PostExistsMiddlware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.pid;

    if (!postId) {
      throw new BadRequestException(':pid 파라미터가 필요합니다');
    }

    const postExists = await this.postsService.checkPostExistById(+postId);

    if (!postExists) {
      throw new BadRequestException('해당 게시글이 존재하지 않습니다');
    }

    next();
  }
}
