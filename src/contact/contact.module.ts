// src/contact/contact.module.ts

import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}
