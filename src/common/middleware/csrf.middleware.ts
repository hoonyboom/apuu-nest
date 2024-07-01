import { Injectable, NestMiddleware } from '@nestjs/common';
import * as csurf from 'csurf';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CsrfTokenIssuingMiddleware implements NestMiddleware {
  private readonly csrfProtection: ReturnType<typeof csurf> = csurf({
    cookie: true,
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.csrfProtection(req, res, () => {
      res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 1000 * 60 * 5),
      });

      next();
    });
  }
}

@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  private readonly csrfProtection: ReturnType<typeof csurf> = csurf({
    cookie: true,
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.csrfProtection(req, res, next);
  }
}
