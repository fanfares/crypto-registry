import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {
  }

  async sendTestEmail(toEmail: string, name: string) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'BCR Test Email',
      template: './test-email',
      context: {
        email: toEmail,
        name: name
      }
    });
  }

  async sendVerificationEmail(
    toEmail: string,
    customerHoldingAmount: number,
    custodianName: string
  ) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'Bitcoin Registry Verification',
      template: './verification',
      context: {
        toEmail: toEmail,
        customerHoldingAmount: customerHoldingAmount,
        custodianName: custodianName
      }
    });
  }


}
