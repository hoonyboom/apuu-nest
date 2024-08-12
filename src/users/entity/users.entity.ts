import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { ChatsModel } from 'src/chats/entity/chats.entity';
import { MessagesModel } from 'src/chats/messages/entities/messages.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { ImagesModel } from 'src/common/entities/image.entity';
import { EmailValidationMessage } from 'src/common/vaildation-message/email-validation.message';
import { LengthValidationMessage } from 'src/common/vaildation-message/length-validation.message';
import { StringValidationMessage } from 'src/common/vaildation-message/string-validation.message';
import { CommentsModel } from 'src/posts/comments/entity/comment.entity';
import { PostsModel } from 'src/posts/entity/posts.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Providers, Roles } from '../const/enum.const';
import { UsersFollowersModel } from './user-followers.entity';

@Entity()
export class UsersModel extends BaseModel {
  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel[];

  @OneToMany(() => CommentsModel, (comment) => comment.author)
  comments: CommentsModel[];

  @OneToMany(() => UsersFollowersModel, (ufm) => ufm.follower)
  @JoinTable()
  followers: UsersFollowersModel[];

  @OneToMany(() => UsersFollowersModel, (ufm) => ufm.followee)
  followees: UsersFollowersModel[];

  @IsOptional()
  @OneToOne(() => ImagesModel, (image) => image.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  image?: ImagesModel;

  @Column({
    default: 0,
  })
  followerCount: number;

  @Column({
    default: 0,
  })
  followeeCount: number;

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

  @Column({ nullable: true })
  @IsOptional()
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
    default: Roles.FREETIER,
  })
  role: Roles;

  @Column({
    type: 'enum',
    enum: Providers,
    default: Providers.EMAIL,
  })
  provider?: Providers;
}
