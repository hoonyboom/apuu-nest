import { IsNumber } from 'class-validator';
import { SendVerificationCodeDTO } from './verify-email.dto';

export class VerifyEmailCodeDTO extends SendVerificationCodeDTO {
  @IsNumber()
  verify_code: number;
}
