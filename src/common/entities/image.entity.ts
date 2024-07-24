import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { join } from 'path';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { UsersModel } from 'src/users/entity/users.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
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
  @IsNumber()
  @IsOptional()
  order?: number;

  @Column({
    type: 'enum',
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @Column({
    unique: true,
  })
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
  src: string;

  @IsOptional()
  @ManyToOne(() => PostsModel, (post) => post.images)
  post?: PostsModel;

  @IsOptional()
  @OneToOne(() => UsersModel, (user) => user.image)
  user?: UsersModel;
}
