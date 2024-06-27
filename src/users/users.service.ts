import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { BasePaginateDTO } from 'src/common/dto/base-pagination.dto';
import { QueryRunner, Repository } from 'typeorm';
import { UsersFollowersModel } from './entity/user-followers.entity';
import { UsersModel } from './entity/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UsersFollowersModel)
    private readonly usersFollowersRepository: Repository<UsersFollowersModel>,
    private readonly commonService: CommonService,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(UsersModel) : this.usersRepository;
  }
  getUsersFollowersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(UsersFollowersModel)
      : this.usersFollowersRepository;
  }

  async getUser(id: number) {
    const user = await this.usersRepository.findOneByOrFail({ id });
    return user;
  }

  async paginateUsers(dto: BasePaginateDTO) {
    return await this.commonService.paginate({
      dto,
      repo: this.usersRepository,
      path: 'users',
    });
  }

  async createUser(body: Pick<UsersModel, 'email' | 'password' | 'nickname'>) {
    const nicknameExists = await this.usersRepository.exists({
      where: { nickname: body.nickname },
    });

    if (nicknameExists) {
      throw new BadRequestException('이미 존재하는 닉네임입니다');
    }

    const emailExists = await this.usersRepository.exists({
      where: { nickname: body.nickname },
    });

    if (emailExists) {
      throw new BadRequestException('이미 존재하는 이메일입니다');
    }

    const user = this.usersRepository.create(body);
    const newUser = await this.usersRepository.save(user);

    return { success: true, data: newUser };
  }

  async deleteUser(authorId: number) {
    try {
      const result = await this.usersRepository.delete(authorId);

      if (result.affected === 0) {
        throw new BadRequestException('존재하지 않는 사용자입니다');
      }

      return { success: true, message: '계정이 삭제되었습니다' };
    } catch (err) {
      throw new ForbiddenException('계정을 삭제하지 못했습니다');
    }
  }

  async getUserByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new BadRequestException('존재하지 않는 이메일입니다');
    }

    return user;
  }

  async checkEmailExists(email: string) {
    const isExists = await this.usersRepository.exists({ where: { email } });

    if (isExists) {
      throw new ForbiddenException('이미 존재하는 이메일입니다');
    }

    return { success: true };
  }

  async getFollowers(userId: number, includeOnlyConfirmed: boolean) {
    const where = {
      followee: { id: userId },
    };

    if (includeOnlyConfirmed) {
      where['isConfirmed'] = true;
    }

    const result = await this.usersFollowersRepository.find({
      where,
      relations: ['follower', 'followee'],
    });

    return result.map((item) => ({
      id: item.follower.id,
      nickname: item.follower.nickname,
      email: item.follower.email,
      isConfirmed: item.isConfirmed,
    }));
  }

  async followUser(userId: number, followeeId: number, qr?: QueryRunner) {
    const repo = this.getUsersFollowersRepository(qr);

    await repo.save({
      follower: { id: userId },
      followee: { id: followeeId },
    });

    return { success: true };
  }

  async confirmFollow(userId: number, followerId: number, qr?: QueryRunner) {
    const repo = this.getUsersFollowersRepository(qr);
    const result = await repo.findOne({
      where: {
        follower: { id: followerId },
        followee: { id: userId },
      },
      relations: ['follower', 'followee'],
    });

    if (!result) {
      throw new BadRequestException('팔로우 요청이 존재하지 않습니다');
    }

    await repo.save({
      ...result,
      isConfirmed: true,
    });

    return { success: true };
  }

  async unFollowUser(userId: number, followeeId: number, qr?: QueryRunner) {
    const repo = this.getUsersFollowersRepository(qr);
    await repo.delete({
      follower: { id: userId },
      followee: { id: followeeId },
    });

    return { success: true };
  }

  async updateFollowCount(
    type: 'whenFollowAccepted' | 'whenUnFollowing',
    userId: number,
    theOtherUserId: number,
    qr?: QueryRunner,
  ) {
    const repo = this.getUsersRepository(qr);

    switch (type) {
      case 'whenFollowAccepted':
        const followerId = theOtherUserId;
        await repo.increment({ id: userId }, 'followerCount', 1);
        await repo.decrement({ id: followerId }, 'followeeCount', 1);
        break;

      case 'whenUnFollowing':
        const followeeId = theOtherUserId;
        await repo.decrement({ id: userId }, 'followeeCount', 1);
        await repo.decrement({ id: followeeId }, 'followerCount', 1);
        break;

      default:
        break;
    }
  }
}
