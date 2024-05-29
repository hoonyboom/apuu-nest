import { PickType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { MessagesModel } from '../entities/messages.entity';

export class CreateMessagesDTO extends PickType(MessagesModel, ['content']) {
  @IsNumber()
  chatId: number;

  @IsNumber()
  authorId: number;
}
