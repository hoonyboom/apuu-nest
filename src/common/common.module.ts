import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as multer from 'multer';
import { extname } from 'path';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { TEMP_FOLDER_PATH } from './const/path.const';
import { ImagesModel } from './entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImagesModel]),
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 * 2,
      },
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        if (
          ext !== '.jpg' &&
          ext !== '.jpeg' &&
          ext !== '.png' &&
          ext !== '.gif' &&
          ext !== '.webp'
        ) {
          return cb(
            new BadRequestException(
              'jpg/jpeg/png/webp/gif 확장자의 파일만 업로드 할 수 있습니다',
            ),
            false,
          );
        } else return cb(null, true);
      },

      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, TEMP_FOLDER_PATH);
        },
        filename: (req, file, cb) => {
          cb(null, `${crypto.randomUUID()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
