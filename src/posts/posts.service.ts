import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { ImageModelType, ImagesModel } from 'src/common/entities/image.entity';
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

  async createPost(
    authorId: number,
    { images, ...dto }: CreatePostDTO,
    qr?: QueryRunner,
  ) {
    const repo = this.getPostRepository(qr);
    const pre_post = repo.create({
      author: {
        id: authorId,
      },
      ...dto,
    });

    let imagesTempToPosts: ImagesModel[] | null = null;
    if (images.at(0)) {
      imagesTempToPosts = await this.insertPostImages(images, pre_post, qr);
    }

    const post: PostsModel = {
      ...pre_post,
      images: imagesTempToPosts ?? [],
    };

    const createdPost = await this.postsRepository.save(post);
    return createdPost;
  }

  async updatePost(
    postId: number,
    { images, ...dto }: UpdatePostDTO,
    qr?: QueryRunner,
  ) {
    const repo = this.getPostRepository(qr);
    const post = await repo.preload({
      id: postId,
      ...dto,
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

  async insertPostImages(images: string[], post: PostsModel, qr?: QueryRunner) {
    const imgArr: ImagesModel[] = [];

    for (let i = 0; i < images.length; i++) {
      const newImage = await this.commonService.createImage(
        {
          order: i,
          src: images[i],
          post: post,
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      );

      imgArr.push(newImage);
    }

    return imgArr;
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
