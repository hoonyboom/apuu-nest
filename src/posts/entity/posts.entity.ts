import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { ImagesModel } from 'src/common/entities/image.entity';
import { StringValidationMessage } from 'src/common/vaildation-message/string-validation.message';
import { UsersModel } from 'src/users/entity/users.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CommentsModel } from '../comments/entity/comment.entity';
import {
  AREA,
  PERIOD,
  PostGoalType,
  PostLevelType,
  PostMethodType,
  PostSortType,
  PostStyleType,
} from './posts.types';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE', // author가 지워지면 포스트도 삭제
  })
  author: UsersModel;

  @OneToMany(() => ImagesModel, (image) => image.post, {
    eager: true,
    cascade: true, // 포스트가 지워지면 images도 삭제
  })
  images: ImagesModel[];

  @OneToMany(() => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];

  @Column({
    default: 0,
  })
  @IsNumber()
  commentsCount: number;

  @Column({
    default: 0,
  })
  likeCount: number;

  @Column({
    default: 0,
  })
  commentCount: number;

  @Column()
  @IsString({
    message: StringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: StringValidationMessage,
  })
  content: string;

  @Column({
    type: 'enum',
    enum: PostSortType,
  })
  @IsEnum(PostSortType)
  sort: PostSortType;

  @Column({
    type: 'enum',
    enum: PostMethodType,
  })
  @IsEnum(PostMethodType)
  method: PostMethodType;

  @Column()
  @IsNumber()
  size: number;

  @Column({
    type: 'enum',
    enum: PERIOD,
  })
  @IsEnum(PERIOD)
  period: typeof PERIOD;

  @Column({
    type: 'enum',
    enum: AREA,
  })
  @IsEnum(AREA)
  area: typeof AREA;

  @Column()
  @IsDate()
  deadline: Date;

  @Column('simple-array')
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PostLevelType, { each: true })
  level: PostLevelType;

  @Column('simple-array')
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PostGoalType, { each: true })
  goal: PostGoalType;

  @Column('simple-array')
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PostStyleType, { each: true })
  style: PostStyleType;
}
