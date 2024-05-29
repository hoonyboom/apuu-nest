import { Controller, Get, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatPaginateDTO } from './dto/chat-paginate.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async paginateChats(@Query() dto: ChatPaginateDTO) {
    return await this.chatsService.paginateChats(dto);
  }
}
