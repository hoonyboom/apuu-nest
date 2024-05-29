import { Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { CommonService } from 'src/common/common.service';
import { Repository } from 'typeorm';
import { ChatPaginateDTO } from './dto/chat-paginate.dto';
import { CreateChatDTO } from './dto/create-chat.dto';
import { ChatsModel } from './entity/chats.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  async paginateChats(@Query() dto: ChatPaginateDTO) {
    return await this.commonService.paginate({
      dto,
      repo: this.chatsRepository,
      path: 'chats',
    });
  }

  async createChat({ userIds, messageId }: CreateChatDTO) {
    const data = this.chatsRepository.create({
      users: userIds.map((id) => ({ id })),
      messages: [{ id: messageId }],
    });

    const chat = await this.chatsRepository.save(data);

    return await this.chatsRepository.findOne({
      where: { id: chat.id },
    });
  }

  async checkIfChatExists(chatIds: number[]) {
    for (const chatId of chatIds) {
      const exists = await this.chatsRepository.exists({
        where: { id: chatId },
      });

      if (!exists) {
        throw new WsException(`Chat with id ${chatId} does not exist`);
      }
    }
  }
}
export { CreateChatDTO };
