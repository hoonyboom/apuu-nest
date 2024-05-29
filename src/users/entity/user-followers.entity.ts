import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from './users.entity';

/**
 * followerId, followeeId로 연결하는 것이 아니라
 * follower, followee를 통째로 넣어서 연결
 * 왜냐면 다른 칼럼을 추가하기 위해서
 */
@Entity()
export class UsersFollowersModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.followers)
  follower: UsersModel;

  @ManyToOne(() => UsersModel, (user) => user.followees)
  followee: UsersModel;

  @Column({ default: false })
  isConfirmed: boolean;
}
  