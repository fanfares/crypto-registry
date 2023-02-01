import { Injectable } from '@nestjs/common';
import { satoshiInBitcoin } from '../utils';
import { RegistrationRecord } from '../types/registration.types';
import { SendMailService } from './send-mail-service';

export interface VerifiedHoldings {
  customerHoldingAmount: number;
  exchangeName: string;
}

@Injectable()
export class MailService {
  constructor(private sendMailService: SendMailService) {
  }

  async sendTestEmail(toEmail: string, name: string) {
    await this.sendMailService.sendMail({
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
    verifiedHoldings: VerifiedHoldings[],
    verificationNodeName: string,
    verificationNodeAddress: string
  ) {
    await this.sendMailService.sendMail({
      to: toEmail,
      subject: 'Crypto Registry Verification',
      template: './verification',
      context: {
        toEmail: toEmail,
        verifiedHoldings: verifiedHoldings.map(holding => ({
          exchangeName: holding.exchangeName,
          customerHoldingAmount: holding.customerHoldingAmount / satoshiInBitcoin
        })),
        verificationNodeName: verificationNodeName,
        verificationNodeAddress: verificationNodeAddress
      }
    });
  }

  async sendRegistrationVerification(
    toEmail: string,
    link: string
  ) {
    await this.sendMailService.sendMail({
      to: toEmail,
      subject: 'Exchange Registration Request',
      template: './email-verification',
      context: { toEmail, link }
    });
  }

  async sendRegistrationApprovalRequest(
    toEmail: string,
    registrationToApprove: RegistrationRecord,
    link: string
  ) {
    await this.sendMailService.sendMail({
      to: toEmail,
      subject: 'Exchange Registration Approval Request',
      template: './registration-approval-request',
      context: {
        toEmail, link,
        exchangeName: registrationToApprove.institutionName,
        registrationEmail: registrationToApprove.email
      }
    });
  }

  async sendRegistrationUpdated(
    registration: RegistrationRecord
  ) {
    await this.sendMailService.sendMail({
      to: registration.email,
      subject: 'Registration Updated',
      template: './registration-updated',
      context: { registration }
    });
  }
}
