import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { PostsModule } from '../posts.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsModel } from './entity/comment.entity';
import { PostExistsMiddlware } from './middleware/post-exist.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsModel]),
    CommonModule,
    PostsModule, // 아래 미들웨어에서 PostsService 주입중
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddlware).forRoutes(CommentsController);
  }
}
