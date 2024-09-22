import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pet } from './schemas/pet.schema';
import { CreatePetDto } from './dto/create-pet.dto';

@Injectable()
export class PetsService {
  constructor(@InjectModel(Pet.name) private petModel: Model<Pet>) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const newPet = new this.petModel(createPetDto);
    return newPet.save();
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petModel.findById(id).exec();
    if (!pet) {
      throw new NotFoundException(`Pet #${id} not found`);
    }
    return pet;
  }

  async findAll(): Promise<Pet[]> {
    return this.petModel.find().exec();
  }

  async findByOwnerId(owner_id: string): Promise<Pet[]> {
    return this.petModel.find({ owner_id }).exec();
  }

  async update(id: string, createPetDto: CreatePetDto): Promise<Pet> {
    const existingPet = await this.petModel.findByIdAndUpdate(
      id,
      createPetDto,
      { new: true },
    );
    if (!existingPet) {
      throw new NotFoundException(`Pet #${id} not found`);
    }
    return existingPet;
  }

  async delete(id: string): Promise<Pet> {
    const deletedPet = await this.petModel.findByIdAndDelete(id);
    if (!deletedPet) {
      throw new NotFoundException(`Pet #${id} not found`);
    }
    return deletedPet;
  }
}
