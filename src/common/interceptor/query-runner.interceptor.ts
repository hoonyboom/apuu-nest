import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, catchError, tap } from 'rxjs';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class QueryRunnerInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = ctx.switchToHttp().getRequest() satisfies Request & {
      qr: QueryRunner;
    };

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    req.qr = qr;

    return next.handle().pipe(
      catchError(async (e) => {
        try {
          await qr.rollbackTransaction();
        } catch (rollbackError) {
          // Log rollback error separately
          console.error('Rollback Error:', rollbackError);
        } finally {
          await qr.release();
        }
        // Log the original error with additional context
        console.error('Original Error:', e);
        throw new InternalServerErrorException(
          `Transaction failed: ${e.message}`,
        );
      }),
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      }),
    );
  }
}
