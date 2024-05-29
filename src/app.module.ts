import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV } from 'src/common/const/env.const';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './auth/guard/bearer-token.guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { ChatsModule } from './chats/chats.module';
import { ChatsModel } from './chats/entity/chats.entity';
import { MessagesModel } from './chats/messages/entities/messages.entity';
import { CommonModule } from './common/common.module';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { BaseModel } from './common/entities/base.entity';
import { ImagesModel } from './common/entities/image.entity';
import { CommentsModule } from './posts/comments/comments.module';
import { CommentsModel } from './posts/comments/entity/comment.entity';
import { PostsModel } from './posts/entity/posts.entity';
import { PostsModule } from './posts/posts.module';
import { UsersFollowersModel } from './users/entity/user-followers.entity';
import { UsersModel } from './users/entity/users.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV.DB_HOST_KEYS],
      port: parseInt(process.env[ENV.DB_PORT_KEYS]),
      username: process.env[ENV.DB_USER_KEYS],
      password: process.env[ENV.DB_PASS_KEYS],
      database: process.env[ENV.DB_NAME_KEYS],
      ssl: { ca: process.env[ENV.CA_CERT_KEYS], rejectUnauthorized: true },
      synchronize: true, // TODO: 프로덕션 환경에서는 false로 설정

      // TODO: 신규 엔티티 잊지 말고 등록
      entities: [
        BaseModel,
        PostsModel,
        UsersModel,
        ImagesModel,
        ChatsModel,
        MessagesModel,
        CommentsModel,
        UsersFollowersModel,
      ],
    }),
    CommonModule,
    PostsModule,
    UsersModule,
    AuthModule,
    ChatsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
