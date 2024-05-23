import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV } from 'common/const/env.const';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { BaseModel } from './common/entities/base.entity';
import { PostsModel } from './posts/entities/posts.entity';
import { PostsModule } from './posts/posts.module';
import { UsersModel } from './users/entities/users.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV.DB_HOST_KEYS],
      port: parseInt(process.env[ENV.DB_PORT_KEYS]),
      username: process.env[ENV.DB_USER_KEYS],
      password: process.env[ENV.DB_PASS_KEYS],
      database: process.env[ENV.DB_NAME_KEYS],
      ssl: { ca: process.env[ENV.CA_CERT_KEYS], rejectUnauthorized: true },
      synchronize: true, // TODO  프로덕션 환경에서는 false로 설정

      // TLDR: 신규 엔티티 잊지 말고 등록
      entities: [BaseModel, PostsModel, UsersModel],
    }),
    CommonModule,
    PostsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
