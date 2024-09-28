import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const newPost = new this.postModel(createPostDto);
    return newPost.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().sort({ created_at: -1 }).exec();
  }

  async findByUserId(user_id: string): Promise<Post[]> {
    return this.postModel.find({ user_id }).sort({ created_at: -1 }).exec();
  }

  async update(id: string, createPostDto: CreatePostDto): Promise<Post> {
    const existingPost = await this.postModel.findByIdAndUpdate(
      id,
      createPostDto,
      { new: true },
    );
    if (!existingPost) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    return existingPost;
  }

  async delete(id: string): Promise<Post> {
    const deletedPost = await this.postModel.findByIdAndDelete(id);
    if (!deletedPost) {
      throw new NotFoundException(`Post #${id} not found`);
    }
    return deletedPost;
  }
}
