import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { ENV } from 'src/common/const/env.const';
import { Providers } from 'src/users/const/enum.const';
import { OAuthUserType } from '../auth.service';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(ENV.NAVER_CLIENT_ID_KEY),
      clientSecret: configService.get<string>(ENV.NAVER_CLIENT_SECRET_KEY),
      callbackURL:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3002/api/auth/login/naver'
          : 'https://apuu.us/api/auth/login/naver',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    try {
      const { _json } = profile;
      const user = {
        email: _json.email,
        nickname: String(_json.email).match(/^[^@]+/)[0],
        provider: Providers.NAVER,
      } satisfies OAuthUserType;
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
