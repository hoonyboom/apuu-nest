import { PickType } from '@nestjs/swagger';
import { UsersModel } from 'src/users/entity/users.entity';

export class RegisterUserDTO extends PickType(UsersModel, [
  'email',
  'nickname',
  'password',
]) {}
