import { PickType } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ImagesModel } from 'src/common/entities/image.entity';

export class DeleteImageDTO extends PickType(ImagesModel, ['src']) {
  @IsIn(['post', 'user'])
  type: 'post' | 'user';
}
