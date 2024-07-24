import { PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UsersModel } from '../entity/users.entity';

const pickedType = PickType(UsersModel, ['nickname', 'password']);

export class UpdateProfileDTO extends PartialType(pickedType) {
  @IsOptional()
  @IsString()
  image?: string;
}
