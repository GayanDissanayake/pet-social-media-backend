import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLikeDto {
  @IsString()
  @IsNotEmpty()
  post_id: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;
}
