import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { QR } from 'src/common/decorator/query-runner.decorator';
import { BasePaginateDTO } from 'src/common/dto/base-pagination.dto';
import { QueryRunnerInterceotor } from 'src/common/interceptor/query-runner.interceptor';
import { QueryRunner } from 'typeorm';
import { Roles } from './const/roles.const';
import { RBAC } from './decorator/roles.decorator';
import { User } from './decorator/user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Get()
  // async getUser(@Body('authorId') authorId: number) {
  //   return await this.usersService.getUser(authorId);
  // }

  /**
   * TODO:
   * 1. 닉네임으로 서치하는 API(GET)
   * 2. 닉네임 업데이트하는 API(PATCH)
   */

  @Get()
  @RBAC(Roles.ADMIN)
  async paginateUsers(@Query() dto: BasePaginateDTO) {
    return await this.usersService.paginateUsers(dto);
  }

  @Delete()
  async deleteUser(@Body('authorId') authorId: number) {
    return await this.usersService.deleteUser(authorId);
  }

  @Get('follow/me')
  async getFollow(
    @User('id') userId: number,
    @Query('includeOnlyConfirmed', new DefaultValuePipe(false), ParseBoolPipe)
    includeOnlyConfirmed: boolean,
  ) {
    return await this.usersService.getFollowers(userId, includeOnlyConfirmed);
  }

  @Post('follow/:fid')
  @UseInterceptors(QueryRunnerInterceotor)
  async postFollow(
    @User('id') userId: number,
    @Param('fid', ParseIntPipe) followeeId: number,
  ) {
    return await this.usersService.followUser(userId, followeeId);
  }

  @Patch('follow/:fid/confirm')
  @UseInterceptors(QueryRunnerInterceotor)
  async patchFollowConfirm(
    @User('id') userId: number,
    @Param('fid', ParseIntPipe) followerId: number,
    @QR() qr: QueryRunner,
  ) {
    await this.usersService.confirmFollow(userId, followerId, qr);
    await this.usersService.updateFollowCount(
      'whenFollowAccepted',
      userId,
      followerId,
      qr,
    );

    return true;
  }

  @Delete('follow/:fid')
  @UseInterceptors(QueryRunnerInterceotor)
  async deleteFollow(
    @User('id') userId: number,
    @Param('fid', ParseIntPipe) followeeId: number,
    @QR() qr: QueryRunner,
  ) {
    await this.usersService.unFollowUser(userId, followeeId, qr);
    await this.usersService.updateFollowCount(
      'whenUnFollowing',
      userId,
      followeeId,
      qr,
    );

    return;
  }
}
