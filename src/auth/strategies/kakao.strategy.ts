import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { ENV } from 'src/common/const/env.const';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(ENV.KAKAO_CLIENT_ID_KEY),
      clientSecret: configService.get<string>(ENV.KAKAO_CLIENT_SECRET_KEY),
      callbackURL:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3002/api/auth/login/kakao'
          : 'https://apuu.us/api/auth/login/kakao',
    });
  }

  async validate(
    // POST /oauth/token 요청에 대한 응답이 담깁니다.
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      const { _json, username } = profile;
      const user = {
        nickname: username,
        email: _json.kakao_account.email,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
