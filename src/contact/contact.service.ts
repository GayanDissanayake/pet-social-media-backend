// src/contact/contact.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContactService {
  constructor(private readonly emailService: EmailService) {}

  async handleContactForm(createContactDto: CreateContactDto): Promise<void> {
    const { email, message } = createContactDto;

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      throw new InternalServerErrorException(
        'Admin email is not configured in environment variables.',
      );
    }

    // Email content
    const subject = 'New Contact Us Message';
    const text = `You have received a new message from ${email}.

Message:
"${message}"

Best regards,
Your Application`;

    const html = `<p>You have received a new message from <strong>${email}</strong>.</p>
<p><em>Message:</em><br/>"${message}"</p>
<p>Best regards,<br/>Your Application</p>`;

    // Send email to admin
    try {
      await this.emailService.sendEmail(adminEmail, subject, text, html);
    } catch (error) {
      console.error('Failed to send contact form email:', error);
      throw new InternalServerErrorException(
        'An error occurred while sending your message.',
      );
    }
  }
}
