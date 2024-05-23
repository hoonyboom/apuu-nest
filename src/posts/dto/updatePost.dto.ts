import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { StringValidationMessage } from 'src/common/vaildation-message/string-validation.message';
import { CreatePostDTO } from './create-post.dto';

export class UpdatePostDTO extends PartialType(CreatePostDTO) {
  @IsString({
    message: StringValidationMessage,
  })
  @IsOptional()
  title?: string;

  @IsString({
    message: StringValidationMessage,
  })
  @IsOptional()
  content?: string;
}
