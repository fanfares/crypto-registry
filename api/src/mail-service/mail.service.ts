import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { IMailService, VerifiedHoldings } from './mail.service.interface';
import { satoshiInBitcoin } from '../utils';
import { ApiConfigService } from '../api-config';
import { RegistrationRecord } from '../types/registration.db';

@Injectable()
export class MailService implements IMailService {
  constructor(private mailerService: MailerService,
              private apiConfigService: ApiConfigService,
              private logger: Logger) {
  }

  async sendTestEmail(toEmail: string, name: string) {
    this.logger.log('Sending email', {
      toEmail,
      name
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
  }

  async sendVerificationEmail(
    toEmail: string,
    verifiedHoldings: VerifiedHoldings[],
    verificationNodeName: string,
    verificationNodeAddress: string
  ) {
    if (!this.apiConfigService.isEmailEnabled) {
      this.logger.warn('Email is disabled', { verifiedHoldings, toEmail });
      return;
    }
    await this.mailerService.sendMail({
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
    if (!this.apiConfigService.isEmailEnabled) {
      this.logger.warn('Email is disabled', { toEmail, link });
      return;
    }
    await this.mailerService.sendMail({
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
    if (!this.apiConfigService.isEmailEnabled) {
      this.logger.warn('Email is disabled', { toEmail, link });
      return;
    }
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'Exchange Registration Approval Request',
      template: './registration-approval-request',
      context: {
        toEmail, link,
        exchangeName: registrationToApprove.name,
        registrationEmail: registrationToApprove.email
      }
    });
  }

  async sendRegistrationUpdated(
    registration: RegistrationRecord
  ) {
    if (!this.apiConfigService.isEmailEnabled) {
      this.logger.warn('Email is disabled', { registration });
      return;
    }
    await this.mailerService.sendMail({
      to: registration.email,
      subject: 'Registration Updated',
      template: './registration-updated',
      context: { registration }
    });
  }
}
