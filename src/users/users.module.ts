import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { UsersFollowersModel } from './entity/user-followers.entity';
import { UsersModel } from './entity/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersModel, UsersFollowersModel])],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService, CommonService],
})
export class UsersModule {}
