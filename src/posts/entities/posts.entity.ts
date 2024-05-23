import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { StringValidationMessage } from 'src/common/vaildation-message/string-validation.message';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  author: UsersModel;

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
