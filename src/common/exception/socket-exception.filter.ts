import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

/**
 * REST API 예외 처리를 하이재킹하는 필터
 */
@Catch(HttpException)
export class SocketExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();

    socket.emit('exception', exception.getResponse());
  }
}
