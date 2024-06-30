import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bycrypt from 'bcrypt';
import { CookieOptions, Request, Response } from 'express';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { ENV } from 'src/common/const/env.const';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDTO } from './dto/register-user.dto';

export type jwtPayload = {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
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
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheStore,
  ) {}

  private generateRandomCode() {
    var min = 100000;
    var max = 999999;
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
    requestTokenType: 'access' | 'refresh',
  ) {
    const payload = {
      sub: id,
      email,
      type: requestTokenType,
    } satisfies jwtPayload;

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENV.JWT_SECRET_KEY),
      expiresIn: requestTokenType === 'refresh' ? '1h' : '5m',
    });
  }

  loginUser(user: UsersModel) {
    return {
      accessToken: this.signToken(user, 'access'),
      refreshToken: this.signToken(user, 'refresh'),
    };
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

  async loginWithEmail({
    email,
    password,
  }: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword({
      email,
      password,
    });

    return this.loginUser(existingUser);
  }

  async registerWithEmail({ email, password, nickname }: RegisterUserDTO) {
    const hash = await bycrypt.hash(
      password,
      parseInt(this.configService.get<string>(ENV.SALT_ROUNDS_KEY)),
    );

    const { data: newUser } = await this.usersService.createUser({
      email,
      nickname,
      password: hash,
    });

    return newUser;
  }

  extractTokenFromHeader(header: string) {
    const splitToken = header.split(' ');
    const [prefix, token] = splitToken as [TokenType, string];

    if (
      splitToken.length !== 2 ||
      (prefix !== 'Basic' && prefix !== 'Bearer')
    ) {
      throw new UnauthorizedException('토큰이 올바르지 않습니다');
    }

    return token;
  }

  decodeBasicToken(base64Token: string) {
    const decoded = atob(base64Token);
    const splitToken = decoded.split(':');

    if (splitToken.length !== 2) {
      throw new UnauthorizedException('토큰이 올바르지 않습니다');
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
      throw new UnauthorizedException('토큰이 올바르지 않습니다');
    }
  }

  async rotateToken(token: string, requestTokenType: 'access' | 'refresh') {
    const payload = await this.verifyToken(token);
    const { email, sub: id, type } = payload;

    if (type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 refreshToken이 필요합니다',
      );
    }

    return this.signToken({ email, id }, requestTokenType);
  }

  async checkEmailExists(email: string) {
    return await this.usersService.checkEmailExists(email);
  }

  async revalidateTokenCookie(req: Request, type: 'access' | 'refresh') {
    const token = req.cookies[`${type}Token`];
    const newToken = await this.rotateToken(token, type);
    this.gererateCookie(req.res, 'refreshToken', newToken);

    return { success: true, message: `${type}Token 재발급 성공` };
  }

  gererateCookie(
    res: Response,
    name: string,
    value: string | boolean | number,
    options?: CookieOptions,
  ) {
    res.cookie(name, value, {
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

  clearAllCookies(res: Response, names: string[]) {
    names.forEach((name) => res.clearCookie(name));
    return { success: true, message: '로그아웃 성공' };
  }
}
