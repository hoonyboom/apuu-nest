import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from 'typeorm';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(ctx: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const path = req.originalUrl;
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          'log',
          `${method} ${path} ${url} ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
