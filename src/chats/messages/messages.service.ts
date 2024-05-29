import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { Repository } from 'typeorm';
import { CreateMessagesDTO } from './dto/create-messages.dto';
import { MessagePaginateDTO } from './dto/message-paginate.dto';
import { MessagesModel } from './entities/messages.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

  async paginateMessages(dto: MessagePaginateDTO, chatRoomId: number) {
    return await this.commonService.paginate({
      dto,
      repo: this.messagesRepository,
      path: `chat/${chatRoomId}/messages`,
      overrideFindOptions: {
        where: {
          chat: { id: chatRoomId },
        },
        relations: ['author', 'chat'],
      },
    });
  }

  async createMessage(dto: CreateMessagesDTO, authorId: number) {
    const data = this.messagesRepository.create({
      chat: { id: dto.chatId },
      author: { id: authorId },
      content: dto.content,
    });

    console.log(data);
    return await this.messagesRepository.save(data);
  }
}
