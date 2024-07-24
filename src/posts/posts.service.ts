import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { ImageModelType } from 'src/common/entities/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostPaginateDTO } from './dto/paginate-post.dto';
import { UpdatePostDTO } from './dto/updatePost.dto';
import { PostsModel } from './entity/posts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async paginatePosts(dto: PostPaginateDTO) {
    return await this.commonService.paginate({
      dto,
      repo: this.postsRepository,
      path: 'posts',
    });
  }

  getPostRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(PostsModel) : this.postsRepository;
  }

  async getPostbyId(id: number, qr?: QueryRunner) {
    const repo = this.getPostRepository(qr);
    const post = await repo.findOneBy({ id });
    if (!post) throw new NotFoundException('존재하지 않는 포스트입니다');

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDTO, qr?: QueryRunner) {
    const repo = this.getPostRepository(qr);

    const post = repo.create({
      author: {
        id: authorId,
      },
      ...postDto,
      images: [],
    });

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async updatePost(postId: number, dto: UpdatePostDTO, qr?: QueryRunner) {
    const repo = this.getPostRepository(qr);
    const post = await repo.preload({
      id: postId,
      title: dto.title,
      content: dto.content,
    });

    if (!post) throw new NotFoundException('존재하지 않는 포스트입니다.');

    const newPost = await repo.save(post);
    return newPost;
  }

  async deletePost(id: number) {
    const postExisting = await this.postsRepository.exists({ where: { id } });

    if (postExisting) {
      await this.postsRepository.delete(id);
      return { success: true };
    } else {
      throw new NotFoundException('포스트를 찾을 수 없습니다');
    }
  }

  async insertPostImages(
    body: CreatePostDTO | UpdatePostDTO,
    post: PostsModel,
    qr?: QueryRunner,
  ) {
    for (let i = 0; i < body.images.length; i++) {
      await this.commonService.createImage(
        {
          order: i,
          src: body.images[i],
          post: post,
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      );
    }
  }

  async checkPostExistById(postId: number) {
    return await this.postsRepository.exists({
      where: { id: postId },
    });
  }

  async isPostMine(postId: number, userId: number) {
    return await this.postsRepository.exists({
      where: { id: postId, author: { id: userId } },
      relations: ['author'],
    });
  }

  async updateCommentsCount(
    type: 'inc' | 'dec',
    postId: number,
    qr?: QueryRunner,
  ) {
    const repo = this.getPostRepository(qr);
    return type === 'inc'
      ? await repo.increment({ id: postId }, 'commentsCount', 1)
      : await repo.decrement({ id: postId }, 'commentsCount', 1);
  }
}
