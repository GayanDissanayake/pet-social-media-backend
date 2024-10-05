// src/contact/dto/create-contact.dto.ts

import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Message content cannot be empty.' })
  @MaxLength(1000, { message: 'Message is too long.' })
  message: string;
}
