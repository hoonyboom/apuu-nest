import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { VALIDATION_CONFIG } from 'src/common/const/validation-config.const';
import { SocketExceptionFilter } from 'src/common/exception/socket-exception.filter';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import { ChatsService, CreateChatDTO } from './chats.service';
import { EnterChatDTO } from './dto/enter-chat.dto';
import { CreateMessagesDTO } from './messages/dto/create-messages.dto';
import { MessagesService } from './messages/messages.service';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`connected: ${socket.id}`);
    const headers = socket.handshake.headers;

    try {
      const rawToken = headers['authorization'];
      if (!rawToken) {
        socket.disconnect();
      }
      const token = this.authService.extractTokenFromHeader(rawToken);
      const payload = await this.authService.verifyToken(token);
      const user = await this.userService.getUserByEmail(payload.email);

      socket.user = user;
    } catch (err) {
      socket.disconnect();
    }
  }

  @UsePipes(new ValidationPipe(VALIDATION_CONFIG))
  @UseFilters(SocketExceptionFilter)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() dto: CreateChatDTO,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(dto);

    socket
      .to(chat.id.toString())
      .emit('create_chat', `${chat.id}번방에 입장하셨습니다`);
  }

  @UsePipes(new ValidationPipe(VALIDATION_CONFIG))
  @UseFilters(SocketExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() { chatIds }: EnterChatDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    await this.chatsService.checkIfChatExists(chatIds);
    await socket.join(chatIds.map((chatId) => chatId.toString()));
  }

  @UsePipes(new ValidationPipe(VALIDATION_CONFIG))
  @UseFilters(SocketExceptionFilter)
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDTO,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    await this.chatsService.checkIfChatExists([dto.chatId]);
    const message = await this.messagesService.createMessage(
      dto,
      socket.user.id,
    );

    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.content);
  }
}
