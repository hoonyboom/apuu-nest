import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { promises as fs } from 'fs';
import path from 'path';
import { TEMP_FOLDER_PATH } from 'src/common/const/path.const';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('0 0 22 * * 0', {
    name: '일요일 밤 10시에 실행',
    timeZone: 'Asia/Seoul',
  })
  async cleanupTempFolder() {
    this.logger.debug('클린업 실행 /public/temp');

    const files = await fs.readdir(TEMP_FOLDER_PATH);
    const now = Date.now();
    const targetCondition = 3 * 24 * 60 * 60 * 1000;

    const deleteOldTempImages = files.map(async (file) => {
      const filePath = path.join(TEMP_FOLDER_PATH, file);

      try {
        var stats = await fs.stat(filePath);
      } catch (error) {
        return this.logger.error(
          `파일을 읽는 데 실패했습니다 ${filePath}:`,
          error,
        );
      }

      if (now - stats.mtime.getTime() > targetCondition) {
        try {
          await fs.rm(filePath);
          this.logger.debug(`오래돼 삭제된 Temp 파일: ${filePath}`);
        } catch (error) {
          this.logger.error(
            `파일을 삭제하는 데 실패했습니다- ${filePath}:`,
            error,
          );
        }
      }
    });

    await Promise.all(deleteOldTempImages);
  }
}
