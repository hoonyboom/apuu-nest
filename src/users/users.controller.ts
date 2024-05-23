import { Body, Controller, Delete, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@Body('authorId') authorId: number) {
    return await this.usersService.getUser(authorId);
  }

  @Delete()
  async deleteUser(@Body('authorId') authorId: number) {
    return await this.usersService.deleteUser(authorId);
  }
}
