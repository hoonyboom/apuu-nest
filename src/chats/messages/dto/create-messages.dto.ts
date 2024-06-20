import { PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { MessagesModel } from '../entities/messages.entity';

export class CreateMessagesDTO extends PickType(MessagesModel, ['content']) {
  @IsNumber()
  chatId: number;

  @IsNumber()
  authorId: number;
}
