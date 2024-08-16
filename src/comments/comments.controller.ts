import { Controller, Post, Delete, Body, Get, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(
      createCommentDto.post_id,
      createCommentDto.user_id,
      createCommentDto.content,
    );
  }

  @Get(':post_id')
  async getComments(@Param('post_id') post_id: string) {
    return this.commentsService.findByPostId(post_id);
  }

  @Delete(':comment_id')
  async deleteComment(@Param('comment_id') comment_id: string) {
    return this.commentsService.delete(comment_id);
  }
}
