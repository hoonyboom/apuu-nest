import { PickType } from '@nestjs/swagger';
import { ImagesModel } from 'src/common/entities/image.entity';

export class CreateUserImageDTO extends PickType(ImagesModel, [
  'src',
  'user',
  'type',
]) {}
