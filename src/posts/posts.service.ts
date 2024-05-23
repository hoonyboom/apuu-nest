import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/updatePost.dto';
import { PostsModel } from './entities/posts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find();
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
