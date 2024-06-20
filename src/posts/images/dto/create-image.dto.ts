import { PickType } from '@nestjs/swagger';
import { ImagesModel } from 'src/common/entities/image.entity';

export class CreatePostImageDTO extends PickType(ImagesModel, [
  'path',
  'post',
  'order',
  'type',
]) {}
