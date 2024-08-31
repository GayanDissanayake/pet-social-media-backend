import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { Pet } from './schemas/pet.schema';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  async create(@Body() createPetDto: CreatePetDto): Promise<Pet> {
    return this.petsService.create(createPetDto);
  }

  @Get()
  async findAll(): Promise<Pet[]> {
    return this.petsService.findAll();
  }

  @Get(':owner_id')
  async findByOwnerId(@Param('owner_id') owner_id: string): Promise<Pet[]> {
    return this.petsService.findByOwnerId(owner_id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() createPetDto: CreatePetDto,
  ): Promise<Pet> {
    return this.petsService.update(id, createPetDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Pet> {
    return this.petsService.delete(id);
  }
}
