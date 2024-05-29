import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ImagesModel } from 'src/common/entities/image.entity';
import { LogMiddleware } from 'src/common/middleware/log.middleware';
import { UsersModule } from 'src/users/users.module';
import { PostsModel } from './entity/posts.entity';
import { PostsImagesService } from './images/images.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImagesModel]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  exports: [PostsService],
  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: 'posts',
      method: RequestMethod.ALL,
    });
  }
}
