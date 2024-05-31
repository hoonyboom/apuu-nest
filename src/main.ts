import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENV } from './common/const/env.const';
import { VALIDATION_CONFIG } from './common/const/validation-config.const';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(VALIDATION_CONFIG));
  // app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env[ENV.PORT_KEY], process.env[ENV.HOST_KEY]);
}

bootstrap();
