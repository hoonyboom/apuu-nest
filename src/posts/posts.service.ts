import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
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

  async getPost(id: number, qr?: QueryRunner) {
    const repo = this.getRepository(qr);
    return await repo.findOneByOrFail({ id });
  }

  getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(PostsModel) : this.postsRepository;
  }

  async createPost(authorId: number, postDto: CreatePostDTO, qr?: QueryRunner) {
    const repo = this.getRepository(qr);

    const post = repo.create({
      author: {
        id: authorId,
      },
      ...postDto,
      images: [],
    });

    const newPost = await this.postsRepository.save(post);
    return { success: true, data: newPost };
  }

  async updatePost(id: number, { title, content }: UpdatePostDTO) {
    const post = await this.postsRepository.findOneOrFail({
      where: { id },
    });

    const updatedPost = this.postsRepository.create({
      title,
      content,
    });

    this.postsRepository.merge(post, updatedPost);

    const newPost = await this.postsRepository.save(post);
    return { success: true, data: newPost };
  }

  async deletePost(id: number) {
    const postExisting = await this.postsRepository.exists({ where: { id } });

    if (postExisting) {
      await this.postsRepository.delete(id);
      return { success: true };
    } else {
      throw new ForbiddenException('포스트를 찾을 수 없습니다');
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
    const repo = this.getRepository(qr);
    return type === 'inc'
      ? await repo.increment({ id: postId }, 'commentsCount', 1)
      : await repo.decrement({ id: postId }, 'commentsCount', 1);
  }
}
