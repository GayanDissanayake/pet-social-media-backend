// import { PartialType } from '@nestjs/mapped-types';
// import { CreatePetDto } from './create-pet.dto';

// export class UpdatePetDto extends PartialType(CreatePetDto) {}

export class UpdatePetDto {
  readonly name?: string;
  readonly age?: number;
  readonly breed?: string;
  readonly owner?: string;
}
