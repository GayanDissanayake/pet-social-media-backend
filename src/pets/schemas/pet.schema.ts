import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pet extends Document {
  @Prop({ required: true })
  owner_id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  breed: string;

  @Prop()
  description: string;

  @Prop()
  shortDescription: string;

  @Prop()
  certifications: string[];

  @Prop()
  location: string;

  @Prop()
  weight: number;

  @Prop()
  image: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const PetSchema = SchemaFactory.createForClass(Pet);
