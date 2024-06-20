import { IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { ImagesModel } from 'src/common/entities/image.entity';
import { StringValidationMessage } from 'src/common/vaildation-message/string-validation.message';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CommentsModel } from '../comments/entity/comment.entity';
import { UsersModel } from 'src/users/entity/users.entity';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  author: UsersModel;

  @OneToMany(() => ImagesModel, (image) => image.post)
  images: ImagesModel[];

  @OneToMany(() => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];

  /**
   * TODO: 과연 필요한가?
   * 1. 댓글 수가 적다면 그냥 comments.length로 처리하는 방법
   * 2.
   */
  @Column({
    default: 0,
  })
  @IsNumber()
  commentsCount: number;

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
    default: 0,
  })
  likeCount: number;

  @Column({
    default: 0,
  })
  commentCount: number;
}
