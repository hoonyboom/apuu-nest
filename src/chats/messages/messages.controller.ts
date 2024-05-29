import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MessagePaginateDTO } from './dto/message-paginate.dto';
import { MessagesService } from './messages.service';

@Controller('chats/:cid/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async paginateMessages(
    @Param('cid', ParseIntPipe) chatRoomId: number,
    @Query() dto: MessagePaginateDTO,
  ) {
    return await this.messagesService.paginateMessages(dto, chatRoomId);
  }
}
