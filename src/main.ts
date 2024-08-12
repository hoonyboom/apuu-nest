import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ENV } from './common/const/env.const';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { VALIDATION_CONFIG } from './common/const/validation-config.const';
import { BasePaginateDTO } from './common/dto/base-pagination.dto';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  app.useStaticAssets(PUBLIC_FOLDER_PATH, {
    prefix: '/public',
  });
  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe(VALIDATION_CONFIG));
  // app.useGlobalFilters(new HttpExceptionFilter());

  const options = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('Your API description')
    .setVersion('1.0')
    .addServer('https://apuu.us/api')
    .addTag('Your API Tag')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    extraModels: [BasePaginateDTO],
  });
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env[ENV.PORT_KEY], process.env[ENV.HOST_KEY]);
}

bootstrap();
