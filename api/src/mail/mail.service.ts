import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendTestEmail(to: string, name: string) {
    await this.mailerService.sendMail({
      to: to,
      subject: 'BCR Test Email',
      template: './test-email',
      context: {
        name: name,
      },
    });
  }
}
