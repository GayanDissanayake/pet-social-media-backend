// src/comments/comments.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private postsService: PostsService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async create(
    post_id: string,
    user_id: string,
    content: string,
  ): Promise<Comment> {
    // Create and save the comment
    const comment = new this.commentModel({ post_id, user_id, content });
    const savedComment = await comment.save();

    // Fetch post details to identify the post owner
    const post = await this.postsService.findOne(post_id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If the commenter is not the post owner, send a notification email
    if (post.user_id.toString() !== user_id.toString()) {
      const postOwner = await this.usersService.findById(post.user_id);
      const commenter = await this.usersService.findById(user_id);

      if (postOwner && postOwner.email) {
        await this.emailService.sendEmail(
          postOwner.email,
          `New Comment on Your Post`,
          `Hello ${postOwner.name},

${commenter.name} has commented on your post titled".

Comment:
"${content}"

Best regards,
Your Application Team`,
          `<p>Hello ${postOwner.name},</p>
<p><strong>${commenter.name}</strong> has commented on your post.</p>
<p><em>Comment:</em><br/>"${content}"</p>
<p>find your post at below link</p><br/>
<p><a href="${process.env.FRONTEND_URL}/feed/detailed/${post_id}">View Post</a></p>
<p>Best regards,<br/>Your Application Team</p>`,
        );
      }
    }

    return savedComment;
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
