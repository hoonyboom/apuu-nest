import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // transformer의 타입 변환, 기본값 할당 허용
      transformOptions: { enableImplicitConversion: true }, // validator를 기반으로 타입 자동 변환

    }),
  );

  await app.listen(3002);
}

bootstrap();
