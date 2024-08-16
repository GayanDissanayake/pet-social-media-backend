import { Controller, Post, Delete, Body, Get, Param } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UnlikeDto } from './dto/unlike.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  async likePost(@Body() createLikeDto: CreateLikeDto) {
    return this.likesService.likePost(
      createLikeDto.post_id,
      createLikeDto.user_id,
    );
  }

  @Delete()
  async unlikePost(@Body() unlikeDto: UnlikeDto) {
    return this.likesService.unlikePost(unlikeDto.post_id, unlikeDto.user_id);
  }

  @Get(':post_id/count')
  async countLikes(@Param('post_id') post_id: string) {
    return this.likesService.countLikes(post_id);
  }
}
