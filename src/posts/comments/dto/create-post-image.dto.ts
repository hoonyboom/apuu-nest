import { PickType } from '@nestjs/swagger';
import { ImagesModel } from 'src/common/entities/image.entity';

export class CreatePostImageDTO extends PickType(ImagesModel, [
  'src',
  'post',
  'order',
  'type',
]) {}
