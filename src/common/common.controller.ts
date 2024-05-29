import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

// TODO: Express 타입이 자꾸 사라지는 버그가 있어 임시 선언
let a: Express;

@Controller('common')
export class CommonController {
  constructor() {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  postImage(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
    };
  }
}
