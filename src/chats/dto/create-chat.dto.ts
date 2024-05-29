import { IsNumber } from 'class-validator';

export class CreateChatDTO {
  @IsNumber({}, { each: true })
  userIds: number[];

  @IsNumber()
  messageId: number;
}
