import { PickType } from '@nestjs/swagger';
import { UsersModel } from 'src/users/entity/users.entity';

export class SendVerificationCodeDTO extends PickType(UsersModel, ['email']) {}
