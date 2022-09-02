import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

export interface VerifiedHoldings {
  customerHoldingAmount: number;
  custodianName: string;
}

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
    verifiedHoldings: VerifiedHoldings[]
  ) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'Bitcoin Registry Verification',
      template: './verification',
      context: {
        toEmail: toEmail,
        verifiedHoldings: verifiedHoldings
      }
    });
  }


}
