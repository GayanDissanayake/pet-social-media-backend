import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteCommentDto {
  @IsString()
  @IsNotEmpty()
  comment_id: string;
}
