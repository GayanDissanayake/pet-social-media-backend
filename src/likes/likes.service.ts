import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from './schemas/like.schema';

@Injectable()
export class LikesService {
  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}

  async likePost(post_id: string, user_id: string): Promise<Like> {
    const existingLike = await this.likeModel.findOne({ post_id, user_id });
    if (existingLike) {
      throw new Error('User already liked this post');
    }

    const like = new this.likeModel({ post_id, user_id });
    return like.save();
  }

  async unlikePost(post_id: string, user_id: string): Promise<void> {
    const result = await this.likeModel.deleteOne({ post_id, user_id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Like not found');
    }
  }

  async countLikes(post_id: string): Promise<number> {
    return this.likeModel.countDocuments({ post_id });
  }
}
