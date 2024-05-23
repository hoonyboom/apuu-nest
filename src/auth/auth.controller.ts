import {
  Body,
  Controller,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  async postLoginEmail(
    @Request()
    req: Request & { tokens: { accessToken: string; refreshToken: string } },
  ) {
    return req.tokens;
  }

  @Post('register/email')
  async postRegisterEmail(@Body() body: RegisterUserDto) {
    return await this.authService.registerWithEmail(body);
  }

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  async postRevalidateAccessToken(
    @Headers('Authorization') authorization: string,
  ) {
    const token = this.authService.extractTokenFromHeader(authorization);
    const newToken = await this.authService.rotateToken(token, 'access');

    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  async postRevalidateRefreshToken(
    @Headers('Authorization') authorization: string,
  ) {
    const token = this.authService.extractTokenFromHeader(authorization);
    const newToken = await this.authService.rotateToken(token, 'refresh');

    return {
      refreshToken: newToken,
    };
  }
}
