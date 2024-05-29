import { IsNumber } from 'class-validator';

export class EnterChatDTO {
  @IsNumber({}, { each: true })
  chatIds: number[];
}
