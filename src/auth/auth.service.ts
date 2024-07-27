import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bycrypt from 'bcrypt';
import { CookieOptions, Request } from 'express';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { ENV } from 'src/common/const/env.const';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDTO } from './dto/register-user.dto';

export type jwtPayload = {
  sub: number;
  email: string;
  type: 'accessToken' | 'refreshToken' | 'XSRF-TOKEN';
};

type TokenType = 'Bearer' | 'Basic';
type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheStore,
  ) {}

  private generateRandomCode() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private createTransporter(): Mail {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>(ENV.EMAIL_USER_KEY),
        pass: this.configService.get<string>(ENV.EMAIL_PASS_KEY),
      },
    });
  }

  async sendVeryficationCode(email: string) {
    const transporter = this.createTransporter();
    const verifyCode = this.generateRandomCode();
    const mailOptions = {
      to: email,
      subject: '이메일 인증 코드',
      html: `인증 코드: ${verifyCode}`,
    } satisfies EmailOptions;

    try {
      await this.cacheManager.set(email, verifyCode, 120000);
      await transporter.sendMail(mailOptions);
      return { success: true, message: '인증 코드가 전송되었습니다' };
    } catch (err) {
      throw new InternalServerErrorException(
        `인증 코드를 Redis에 저장하는 데 실패했습니다. ${err.message}`,
      );
    }
  }

  async verifyEmailCode(email: string, verifyCode: number) {
    const cachedCode = await this.cacheManager.get<number>(email);

    if (!cachedCode) {
      throw new NotFoundException(
        '해당 메일로 인증 코드가 전송되지 않았습니다.',
      );
    } else if (cachedCode !== verifyCode) {
      throw new UnauthorizedException('인증 코드가 일치하지 않습니다');
    } else {
      await this.cacheManager.del(email);
      return { success: true };
    }
  }

  signToken(
    { email, id }: Pick<UsersModel, 'email' | 'id'>,
    requestTokenType: jwtPayload['type'],
  ) {
    const payload = {
      sub: id,
      email,
      type: requestTokenType,
    } satisfies jwtPayload;

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENV.JWT_SECRET_KEY),
      expiresIn: requestTokenType === 'refreshToken' ? '1h' : '5m',
    });
  }

  loginUser(req: Request, user: UsersModel) {
    const tokens = {
      accessToken: this.signToken(user, 'accessToken'),
      refreshToken: this.signToken(user, 'refreshToken'),
      xsrfToken: this.signToken(user, 'XSRF-TOKEN'),
    };

    this.issueCookie(req, 'refreshToken', tokens.refreshToken);
    this.issueCookie(req, 'accessToken', tokens.accessToken);
    this.issueCookie(req, 'XSRF-TOKEN', tokens.xsrfToken, {
      httpOnly: false,
    });
    this.issueCookie(req, 'isTokenAlive', true, {
      httpOnly: false,
    });
  }

  async authenticateWithEmailAndPassword({
    email,
    password,
  }: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.usersService.getUserByEmail(email);

    const passOk = await bycrypt.compare(password, existingUser.password);
    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다');
    }

    return existingUser;
  }

  async loginWithEmail(
    req: Request,
    { email, password }: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.authenticateWithEmailAndPassword({
      email,
      password,
    });

    this.loginUser(req, existingUser);

    return existingUser;
  }

  async registerWithEmail({ email, password, nickname }: RegisterUserDTO) {
    const hash = await this.hashPassword(password);
    const newUser = await this.usersService.createUser({
      email,
      nickname,
      password: hash,
    });

    return newUser;
  }

  async hashPassword(password: string) {
    const hash = await bycrypt.hash(
      password,
      parseInt(this.configService.get<string>(ENV.SALT_ROUNDS_KEY)),
    );

    return hash;
  }

  extractTokenFromHeader(header: string) {
    const splitToken = header.split(' ');
    const [prefix, token] = splitToken as [TokenType, string];

    if (
      splitToken.length !== 2 ||
      (prefix !== 'Basic' && prefix !== 'Bearer')
    ) {
      throw new UnauthorizedException(
        '올바르지 않은 토큰입니다. 헤더로부터 추출할 수 없습니다',
      );
    }

    return token;
  }

  decodeBasicToken(base64Token: string) {
    const decoded = atob(base64Token);
    const splitToken = decoded.split(':');

    if (splitToken.length !== 2) {
      throw new UnauthorizedException(
        '올바르지 않은 토큰입니다. 디코딩할 수 없습니다',
      );
    }

    const [email, password] = splitToken;

    return { email, password };
  }

  async verifyToken(token: string): Promise<jwtPayload> {
    try {
      return await this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV.JWT_SECRET_KEY),
      });
    } catch (err) {
      throw new UnauthorizedException(
        '올바르지 않은 토큰입니다. 검증할 수 없습니다',
      );
    }
  }

  async rotateToken(
    refreshToken: string,
    requestTokenType: jwtPayload['type'],
  ) {
    const payload = await this.verifyToken(refreshToken);
    const { email, sub: id, type } = payload;

    if (type !== 'refreshToken') {
      throw new UnauthorizedException(
        '토큰 재발급은 refreshToken이 필요합니다',
      );
    }

    return this.signToken({ email, id }, requestTokenType);
  }

  async checkEmailExists(email: string) {
    return await this.usersService.checkEmailExists(email);
  }

  async revalidateTokenCookie(
    req: Request,
    requestedToken: jwtPayload['type'],
    options?: CookieOptions,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    const newToken = await this.rotateToken(refreshToken, requestedToken);
    this.issueCookie(req, requestedToken, newToken, options);

    return { success: true, message: `${requestedToken} 재발급 성공` };
  }

  issueCookie(
    req: Request,
    name: jwtPayload['type'] | 'isTokenAlive',
    value: string | boolean | number,
    options?: CookieOptions,
  ) {
    req.res.cookie(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires:
        name === 'refreshToken'
          ? new Date(Date.now() + 1000 * 60 * 60)
          : new Date(Date.now() + 1000 * 60 * 5),
      ...options,
    });
  }

  clearAllCookies(req: Request) {
    const allCookies = [
      'XSRF-TOKEN',
      'accessToken',
      'isTokenAlive',
      'refreshToken',
    ] satisfies (jwtPayload['type'] | 'isTokenAlive')[];

    allCookies.forEach((cookie) => req.res.clearCookie(cookie));
    return { success: true, message: '로그아웃 성공' };
  }
}
