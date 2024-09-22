import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePetDto {
  @IsNotEmpty()
  @IsString()
  owner_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  age: number;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  breed: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription: string;

  @IsOptional()
  certifications: string[];

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  image?: string;
}
