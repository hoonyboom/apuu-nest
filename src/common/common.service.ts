import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { basename, join } from 'path';
import { ENV } from 'src/common/const/env.const';
import {
  FILTER_MAPPER,
  FilterMapperKeys,
} from 'src/common/const/filter-mapper.const';
import { CreatePostImageDTO } from 'src/posts/comments/dto/create-post-image.dto';
import { CreateUserImageDTO } from 'src/users/dto/create-user-image.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  QueryRunner,
  Repository,
} from 'typeorm';
import {
  POSTS_IMAGE_PATH,
  TEMP_FOLDER_PATH,
  USERS_IMAGE_PATH,
} from './const/path.const';
import { BasePaginateDTO } from './dto/base-pagination.dto';
import { DeleteImageDTO } from './dto/delete-image.dto';
import { BaseModel } from './entities/base.entity';
import { ImageModelType, ImagesModel } from './entities/image.entity';

type PaginateParams<T> = {
  dto: BasePaginateDTO;
  repo: Repository<T>;
  overrideFindOptions?: FindManyOptions<T>;
  path?: string;
};

@Injectable()
export class CommonService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ImagesModel)
    private readonly imageRepository: Repository<ImagesModel>,
  ) {}

  public paginate<T extends BaseModel>({
    dto,
    repo,
    overrideFindOptions = {},
    path,
  }: PaginateParams<T>) {
    if (dto.page !== undefined) {
      return this.pagePaginate({ dto, repo, overrideFindOptions });
    } else {
      return this.cursorPaginate({ dto, repo, overrideFindOptions, path });
    }
  }

  private async pagePaginate<T extends BaseModel>({
    dto,
    repo,
    overrideFindOptions,
  }: PaginateParams<T>) {
    const findOptions = this.composeFindOptions<T>(dto);
    const [data, total] = await repo.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total,
    };
  }

  private getAddress() {
    const protocol = this.configService.get<string>(ENV.PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV.HOST_KEY);
    const port = this.configService.get<string>(ENV.PORT_KEY);

    return {
      protocol,
      host,
      port,
    };
  }

  private async cursorPaginate<T extends BaseModel>({
    dto,
    repo,
    overrideFindOptions,
    path,
  }: PaginateParams<T>) {
    const findOptions = this.composeFindOptions<T>(dto);
    const results = await repo.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const { protocol, host, port } = this.getAddress();
    const lastItem =
      results.length === dto.take && results.length > 0
        ? results.at(-1).id
        : null;
    const nextUrl = new URL(`${protocol}://${host}:${port}/${path}`);

    {
      for (const [key, value] of Object.entries(dto)) {
        if (
          value &&
          key !== 'where__id__more_than' &&
          key !== 'where__id__less_than'
        ) {
          nextUrl.searchParams.append(key, value);
        }
      }

      let key;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else if (dto.order__createdAt === 'DESC') {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem?.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem,
      },
      count: results.length,
      next: lastItem ? nextUrl?.toString() : null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginateDTO,
  ): FindManyOptions<T> {
    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        var where: FindOptionsWhere<T> = {};
        this.filterParser(key, value, where);
      } else if (key.startsWith('order__')) {
        var order: FindOptionsOrder<T> = {};
        this.filterParser(key, value, order);
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * dto.page : null,
    };
  }

  private filterParser<T>(
    key: string,
    value: any,
    options: FindOptionsWhere<T> | FindOptionsOrder<T>,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const split = key.split('__');

    if (split.length === 3) {
      const [_, field, condition] = split as [string, string, FilterMapperKeys];
      const values = value.toString().split(',');

      switch (condition) {
        case 'between':
          options[field] = FILTER_MAPPER[condition](values[0], values[1]);
          break;

        case 'i_like':
          options[field] = FILTER_MAPPER[condition](`%${value}%`);

        default:
          options[field] = FILTER_MAPPER[condition](value);
          break;
      }
    } else if (split.length === 2) {
      const [_, field] = split;
      options[field] = value;
    }

    return options;
  }

  private getImageRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ImagesModel) : this.imageRepository;
  }

  async createImage(
    dto: CreateUserImageDTO | CreatePostImageDTO,
    qr?: QueryRunner,
  ): Promise<ImagesModel> {
    const repo = this.getImageRepository(qr);
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.src);
    const path =
      dto.type === ImageModelType.POST_IMAGE
        ? POSTS_IMAGE_PATH
        : USERS_IMAGE_PATH;

    try {
      await promises.access(tempFilePath);
    } catch (error) {
      throw new BadRequestException('파일을 찾을 수 없습니다');
    }

    const filename = basename(tempFilePath);
    const newPath = join(path, filename);
    const result = await repo.save(dto);

    await promises.rename(tempFilePath, newPath);

    return result;
  }

  async deleteImage({ src, type }: DeleteImageDTO, qr?: QueryRunner) {
    const repo = this.getImageRepository(qr);
    const imageExisting = await repo.exists({ where: { src } });

    if (imageExisting) {
      await repo.delete(src);
    } else {
      throw new NotFoundException('존재하지 않는 이미지입니다');
    }

    const path = type === 'post' ? POSTS_IMAGE_PATH : USERS_IMAGE_PATH;

    // 스토리지에서 삭제
    const filepath = join(path, src);
    await promises.rm(filepath);

    return { success: true };
  }
}
