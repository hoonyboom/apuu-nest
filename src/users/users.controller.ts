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
import { ApiTags } from '@nestjs/swagger';
import { CommonService } from 'src/common/common.service';
import { QR } from 'src/common/decorator/query-runner.decorator';
import { BasePaginateDTO } from 'src/common/dto/base-pagination.dto';
import { ImageModelType } from 'src/common/entities/image.entity';
import { QueryRunnerInterceptor } from 'src/common/interceptor/query-runner.interceptor';
import { QueryRunner } from 'typeorm';
import { Roles } from './const/enum.const';
import { RBAC } from './decorator/roles.decorator';
import { User } from './decorator/user.decorator';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
  ) {}

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

  @Patch()
  @UseInterceptors(QueryRunnerInterceptor)
  async updateUser(
    @User('id') userId: number,
    @Body() body: UpdateProfileDTO,
    @QR() qr: QueryRunner,
  ) {
    const user = await this.usersService.updateUserProfile(userId, body, qr);
    if (body.image) {
      await this.commonService.createImage(
        {
          type: ImageModelType.USER_IMAGE,
          src: body.image,
          user,
        },
        qr,
      );
    }

    return this.usersService.getUser(userId);
  }

  @Delete()
  async deleteUser(@User('id') authorId: number) {
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
  @UseInterceptors(QueryRunnerInterceptor)
  async postFollow(
    @User('id') userId: number,
    @Param('fid', ParseIntPipe) followeeId: number,
  ) {
    return await this.usersService.followUser(userId, followeeId);
  }

  @Patch('follow/:fid/confirm')
  @UseInterceptors(QueryRunnerInterceptor)
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
  @UseInterceptors(QueryRunnerInterceptor)
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

    return true;
  }
}
