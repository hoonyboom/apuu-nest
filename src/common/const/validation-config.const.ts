import { ValidationPipeOptions } from '@nestjs/common';

export const VALIDATION_CONFIG = {
  transform: true, // transformer의 타입 변환, 기본값 할당 허용
  transformOptions: { enableImplicitConversion: true }, // validator를 기반으로 타입 자동 변환
  whitelist: true, // DTO에 정의되지 않은 속성은 차단
  forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 들어오면 에러로 알림
} satisfies ValidationPipeOptions;
