import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCookieAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request as RequestType } from 'express';
import { UsersModel } from 'src/users/entity/users.entity';
import { AuthService } from './auth.service';
import { IsPublic } from './decorator/is-public.decorator';
import { RegisterUserDTO } from './dto/register-user.dto';
import { VerifyEmailCodeDTO } from './dto/verify-code.dto';
import { SendVerificationCodeDTO } from './dto/verify-email.dto';
import { RefreshTokenGuard } from './guard/base-token.guard';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RegisterInterceptor } from './interceptor/register.interceptor';

@ApiTags('Auth')
@Controller('auth')
@IsPublic()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  /**
   * Basic Auth를 사용하여 로그인을 수행합니다. \
   * Base64로 인코딩한 이메일과 비밀번호를 Authorization 헤더에 담아 요청합니다. \
   * atob('email:password') => Basic 'dGVzdEB0ZXN0LmNvbTpwYXNzd29yZA=='
   */
  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  @ApiBasicAuth()
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: RegisterUserDTO,
  })
  async postLoginEmail(
    @Request()
    req: RequestType & { user: UsersModel },
  ) {
    return req.user;
  }

  /**
   * 이메일과 비밀번호, 닉네임을 받아 회원가입을 진행합니다. \
   * 길이 제한은 RegisterUserDTO 스키마를 참고해주세요
   */
  @Post('register/email')
  @UseInterceptors(RegisterInterceptor)
  async postRegisterEmail(@Body() body: RegisterUserDTO) {
    return await this.authService.registerWithEmail(body);
  }

  @Post('register/check_email')
  async postCheckEmailExists(@Body() body: SendVerificationCodeDTO) {
    return await this.authService.checkEmailExists(body.email);
  }

  @Post('register/send_code')
  async postSendVerificationCode(@Body() body: SendVerificationCodeDTO) {
    return await this.authService.sendVeryficationCode(body.email);
  }

  @Post('register/verify_code')
  async postVerifyEmailCode(@Body() body: VerifyEmailCodeDTO) {
    return await this.authService.verifyEmailCode(body.email, body.verify_code);
  }

  /**
   * Refresh Token으로 만료된 Access Token을 재발급합니다.
   */
  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  @ApiCookieAuth()
  async postRevalidateAccessToken(@Request() req: RequestType) {
    return await this.authService.revalidateTokenCookie(req, 'access');
  }

  /**
   * Refresh Token으로 Refresh Token을 재발급합니다. 로그인 시간을 연장합니다.
   */
  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiCookieAuth()
  async postRevalidateRefreshToken(@Request() req: RequestType) {
    return await this.authService.revalidateTokenCookie(req, 'refresh');
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @ApiCookieAuth()
  postLogout(@Request() req: RequestType) {
    this.authService.clearAllCookies(req.res, [
      'refreshToken',
      'accessToken',
      'isTokenAlive',
    ]);
  }
}
