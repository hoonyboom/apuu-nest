import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { join } from 'path';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import {
  POST_PUBLIC_IMAGE_PATH,
  USER_PUBLIC_IMAGE_PATH,
} from '../const/path.const';
import { BaseModel } from './base.entity';

export enum ImageModelType {
  POST_IMAGE,
  USER_IMAGE,
}

@Entity()
export class ImagesModel extends BaseModel {
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order?: number;

  @Column({
    type: 'enum',
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    switch (obj.type) {
      case ImageModelType.POST_IMAGE:
        return `/${join(POST_PUBLIC_IMAGE_PATH, value)}`;
      case ImageModelType.USER_IMAGE:
        return `/${join(USER_PUBLIC_IMAGE_PATH, value)}`;
      default:
        return value;
    }
  })
  path: string;

  @ManyToOne(() => PostsModel, (post) => post.images, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  post?: PostsModel;
}
