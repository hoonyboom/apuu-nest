import { Exclude } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { EmailValidationMessage } from 'src/common/vaildation-message/email-validation.message';
import { LengthValidationMessage } from 'src/common/vaildation-message/length-validation.message';
import { StringValidationMessage } from 'src/common/vaildation-message/string-validation.message';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Roles } from '../const/roles.const';

@Entity()
export class UsersModel extends BaseModel {
  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @Column({
    unique: true,
    length: 12,
  })
  @IsString({
    message: StringValidationMessage,
  })
  @Length(2, 12, {
    message: LengthValidationMessage,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({
    message: StringValidationMessage,
  })
  @IsEmail(undefined, {
    message: EmailValidationMessage,
  })
  email: string;

  @Column()
  @IsString({
    message: StringValidationMessage,
  })
  @Length(8, 20, {
    message: LengthValidationMessage,
  })
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.USER,
  })
  role: Roles;
}
