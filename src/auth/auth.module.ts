import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ENV } from 'src/common/const/env.const';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KakaoStrategy } from './strategies/kakao.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env[ENV.JWT_SECRET_KEY],
    }),
    PassportModule,
    forwardRef(() => UsersModule),
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService, KakaoStrategy],
})
export class AuthModule {}
