import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { basename, join } from 'path';
import {
  POSTS_IMAGE_PATH,
  TEMP_FOLDER_PATH,
} from 'src/common/const/path.const';
import { ImagesModel } from 'src/common/entities/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostImageDTO } from './dto/create-image.dto';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImagesModel)
    private readonly imageRepository: Repository<ImagesModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ImagesModel) : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDTO, qr?: QueryRunner) {
    const repo = this.getRepository(qr);
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      await promises.access(tempFilePath);
    } catch (error) {
      throw new BadRequestException('파일을 찾을 수 없습니다');
    }

    const filename = basename(tempFilePath);
    const newPath = join(POSTS_IMAGE_PATH, filename);

    const result = await repo.save({
      ...dto,
    });

    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
