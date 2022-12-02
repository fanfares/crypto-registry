import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { IMailService, VerifiedHoldings } from './mail.service.interface';

@Injectable()
export class MailService implements IMailService {
  constructor(
    private mailerService: MailerService,
    private logger: Logger
  ) {
  }

  async sendTestEmail(toEmail: string, name: string) {
    this.logger.log('Sending email', {
      toEmail, name
    });
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'BCR Test Email',
      template: './test-email',
      context: {
        email: toEmail,
        name: name
      }
    });
    return {
      status: 'ok'
    };
  }

  async sendVerificationEmail(
    toEmail: string,
    verifiedHoldings: VerifiedHoldings[]
  ) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'Crypto Registry Verification',
      template: './verification',
      context: {
        toEmail: toEmail,
        verifiedHoldings: verifiedHoldings
      }
    });
  }
}
