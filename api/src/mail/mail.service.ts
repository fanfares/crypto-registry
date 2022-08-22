import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CustodianWalletBase, CustomerHolding, CustomerHoldingRecord, CustodianWalletRecord } from '@bcr/types';

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

  async sendVerificationEmail(
    toEmail: string,
    custodianWallet: CustodianWalletRecord,
    customerHolding: CustomerHoldingRecord
    ) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'Bitcoin Registry Verification',
      template: './verification',
      context: {
        customerHoldingAmount: customerHolding.amount,
        custodianName: custodianWallet.custodianName
      },
    });
  }


}
