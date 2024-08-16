import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(
    post_id: string,
    user_id: string,
    content: string,
  ): Promise<Comment> {
    const comment = new this.commentModel({ post_id, user_id, content });
    return comment.save();
  }

  async delete(comment_id: string): Promise<void> {
    const result = await this.commentModel.findByIdAndDelete(comment_id);
    if (!result) {
      throw new NotFoundException('Comment not found');
    }
  }

  async findByPostId(post_id: string): Promise<Comment[]> {
    return this.commentModel.find({ post_id }).exec();
  }
}
