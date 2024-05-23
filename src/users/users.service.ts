import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async getUser(id: number) {
    const user = await this.usersRepository.findOneByOrFail({ id });
    return user;
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
    const user = await this.usersRepository.findOneByOrFail({
      id: authorId,
    });

    try {
      await this.usersRepository.delete(authorId);
      return { success: true };
    } catch (err) {
      throw new ForbiddenException();
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (err) {
      throw new BadRequestException('존재하지 않는 이메일입니다');
    }
  }
}
