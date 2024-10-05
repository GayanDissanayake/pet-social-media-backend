// src/contact/contact.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendContactForm(@Body() createContactDto: CreateContactDto) {
    await this.contactService.handleContactForm(createContactDto);
    return { message: 'Your message has been sent successfully.' };
  }
}
