import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ENV } from 'common/const/env.const';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { CreatePostDTO } from './dto/create-post.dto';
import { PaginatePostDTO } from './dto/paginate-post.dto';
import { UpdatePostDTO } from './dto/updatePost.dto';
import { PostsModel } from './entities/posts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly configService: ConfigService,
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find();
  }

  get getAddress() {
    const protocol = this.configService.get<string>(ENV.PROTOCOL_KEYS);
    const host = this.configService.get<string>(ENV.HOST_KEYS);

    return {
      protocol,
      host,
    };
  }

  async paginatePosts(dto: PaginatePostDTO) {
    if (dto.page) {
      return await this.pagePaginatePosts(dto);
    } else {
      return await this.cursorPaginatePosts(dto);
    }
  }

  async pagePaginatePosts(dto: PaginatePostDTO) {
    const [posts, count] = await this.postsRepository.findAndCount({
      take: dto.take,
      skip: dto.take * dto.page,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDTO) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__id_more_than) {
      where.id = MoreThan(dto.where__id_more_than);
    } else if (dto.where__id_less_than) {
      where.id = LessThan(dto.where__id_less_than);
    }

    const posts = await this.postsRepository.find({
      where,
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    const { protocol, host } = this.getAddress;
    const lastItem =
      posts.length === dto.take && posts.length > 0 ? posts.at(-1).id : null;
    const nextUrl = new URL(`${protocol}://${host}/posts`);

    {
      for (const [key, value] of Object.entries(dto)) {
        if (
          value &&
          key !== 'where__id_more_than' &&
          key !== 'where__id_less_than'
        ) {
          nextUrl.searchParams.append(key, value);
        }
      }

      let key;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id_more_than';
      } else if (dto.order__createdAt === 'DESC') {
        key = 'where__id_less_than';
      }

      nextUrl.searchParams.append(key, lastItem?.toString());
    }

    return {
      data: posts,
      cursor: {
        after: lastItem,
      },
      count: posts.length,
      next: lastItem ? nextUrl?.toString() : null,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOneByOrFail({ id });

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDTO) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
    });

    const newPost = await this.postsRepository.save(post);
    return { success: true, data: newPost };
  }

  async updatePost(id: number, body: UpdatePostDTO) {
    const post = await this.postsRepository.findOneOrFail({
      where: { id },
    });

    const result = await this.postsRepository.update(id, body);
    return { success: true, data: result };
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOneOrFail({
      where: { id: id },
    });

    try {
      await this.postsRepository.delete(id);
      return { success: true };
    } catch (err) {
      throw new ForbiddenException();
    }
  }
}
