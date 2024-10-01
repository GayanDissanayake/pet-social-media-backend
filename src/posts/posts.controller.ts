import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as PostEntity } from './schemas/post.schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(createPostDto);
  }

  @Get('post/:id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @Get()
  async findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Get(':user_id')
  async findByUserId(@Param('user_id') user_id: string): Promise<PostEntity[]> {
    return this.postsService.findByUserId(user_id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(id, createPostDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.delete(id);
  }
}
