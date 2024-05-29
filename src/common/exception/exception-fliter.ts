import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception.getStatus();

    res.status(status).json({
      statusCode: status,
      message: exception.message,
      path: ctx.getRequest().url,
      timestamp: new Date().toLocaleDateString('kr'),
    });
  }
}
