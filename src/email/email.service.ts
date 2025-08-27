import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new Error(
        'SENDGRID_API_KEY is not defined in environment variables',
      );
    }
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    const msg = {
      to,
      from:
        this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
        this.configService.get<string>('EMAIL_FROM'),
      subject,
      text,
      html,
    };

    try {
      const result = await sgMail.send(msg);
      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        statusCode: result[0].statusCode,
      };
    } catch (error) {
      console.error('Error sending email with SendGrid:', error);

      // Provide more specific error messages
      if (error.code === 401) {
        throw new InternalServerErrorException(
          'SendGrid API key is invalid or unauthorized. Please check your SendGrid configuration.',
        );
      } else if (error.code === 403) {
        throw new InternalServerErrorException(
          'SendGrid account suspended or insufficient permissions.',
        );
      } else {
        throw new InternalServerErrorException('Failed to send email.');
      }
    }
  }
}
