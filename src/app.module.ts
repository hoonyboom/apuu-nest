import { CacheModule } from '@nestjs/cache-manager';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
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
    CacheModule.registerAsync<RegistrationOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>(ENV.REDIS_HOST_KEY),
            port: parseInt(configService.get<string>(ENV.REDIS_PORT_KEY)),
          },
        }),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(ENV.DB_HOST_KEY),
        port: parseInt(configService.get<string>(ENV.DB_PORT_KEY)),
        username: configService.get<string>(ENV.DB_USER_KEY),
        password: configService.get<string>(ENV.DB_PASS_KEY),
        database: configService.get<string>(ENV.DB_NAME_KEY),
        synchronize:
          configService.get<string>(ENV.NODE_ENV_KEY) === 'development'
            ? true
            : false,

        // TODO: 신규 엔티티 잊지 말고 등록
        autoLoadEntities: true,
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
