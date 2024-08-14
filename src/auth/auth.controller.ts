import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBasicAuth,
  ApiCookieAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CLIENT_URL } from 'src/common/const/path.const';
import { UsersModel } from 'src/users/entity/users.entity';
import { AuthService, OAuthUserType } from './auth.service';
import { IsPublic } from './decorator/is-public.decorator';
import { RegisterUserDTO } from './dto/register-user.dto';
import { VerifyEmailCodeDTO } from './dto/verify-code.dto';
import { SendVerificationCodeDTO } from './dto/verify-email.dto';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
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
    @Req()
    req: Request & {
      user: UsersModel;
      tokens?: { accessToken: string; refreshToken: string };
    },
  ) {
    return { user: req.user, tokens: req.tokens };
  }

  @Get('login/kakao')
  @UseGuards(AuthGuard('kakao'))
  @HttpCode(301)
  async postLoginKakao(
    @Req() req: Request & { user: OAuthUserType },
    @Res() res: Response,
  ) {
    const { user } = await this.authService.oAuthLogin(req);
    const encodeUser = encodeURIComponent(JSON.stringify(user));

    return res.redirect(`${CLIENT_URL}/?user=${encodeUser}`);
  }

  @Get('login/naver')
  @UseGuards(AuthGuard('naver'))
  @HttpCode(301)
  async postLoginNaver(
    @Req() req: Request & { user: OAuthUserType },
    @Res() res: Response,
  ) {
    const { user } = await this.authService.oAuthLogin(req);
    const encodeUser = encodeURIComponent(JSON.stringify(user));

    return res.redirect(`${CLIENT_URL}/?user=${encodeUser}`);
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
  async postRevalidateAccessToken(@Req() req: Request) {
    this.authService.issueCookie(req, 'isTokenAlive', true, {
      httpOnly: false,
    });
    await this.authService.revalidateTokenCookie(req, 'XSRF-TOKEN', {
      httpOnly: false,
    });
    return await this.authService.revalidateTokenCookie(req, 'accessToken');
  }

  /**
   * Refresh Token으로 Refresh Token을 재발급합니다. 로그인 시간을 연장합니다.
   */
  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiCookieAuth()
  async postRevalidateRefreshToken(@Req() req: Request) {
    return await this.authService.revalidateTokenCookie(req, 'refreshToken');
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @ApiCookieAuth()
  postLogout(@Req() req: Request) {
    return this.authService.clearAllCookies(req);
  }
}
