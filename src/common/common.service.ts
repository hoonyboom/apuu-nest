import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/common/const/env.const';
import {
  FILTER_MAPPER,
  FilterMapperKeys,
} from 'src/common/const/filter-mapper.const';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BasePaginateDTO } from './dto/base-pagination.dto';
import { BaseModel } from './entities/base.entity';

type PaginateParams<T> = {
  dto: BasePaginateDTO;
  repo: Repository<T>;
  overrideFindOptions?: FindManyOptions<T>;
  path?: string;
};

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  get getAddress() {
    const protocol = this.configService.get<string>(ENV.PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV.HOST_KEY);

    return {
      protocol,
      host,
    };
  }

  paginate<T extends BaseModel>({
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

    const { protocol, host } = this.getAddress;
    const lastItem =
      results.length === dto.take && results.length > 0
        ? results.at(-1).id
        : null;
    const nextUrl = new URL(`${protocol}://${host}/${path}`);

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
}
