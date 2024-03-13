import { Injectable } from '@nestjs/common';
import { MailService } from './mail.service';
import { getTokenFromLink } from '../utils/get-token-from-link';
import { VerifiedHoldings } from '@bcr/types';
import { RegistrationRecord } from '../types/registration.types';

@Injectable()
export class MockMailService extends MailService {
  lastMailData: any;
  lastMailTo: string;
  lastMailSubject: string;
  lastMailLink: string;

  constructor() {
    super(null);
  }

  getVal(name: string) {
    return this.lastMailData[name] ?? null;
  }

  get noEmailSent() {
    return !this.lastMailData;
  }

  reset() {
    this.lastMailSubject = undefined;
    this.lastMailTo = undefined;
    this.lastMailData = undefined;
  }

  get link() {
    return this.lastMailLink;
  }

  get token() {
    return getTokenFromLink(this.lastMailLink);
  }

  async sendExchangeUserInvite(
    toEmail: string,
    link: string
  ) {
    this.lastMailTo = toEmail;
    this.lastMailLink = link;
  }

  async sendVerificationEmail(
    toEmail: string,
    verifiedHoldings: VerifiedHoldings[],
    institutionName: string
  ) {
    this.lastMailTo = toEmail;
    this.lastMailData = {verifiedHoldings, institutionName};
  }

  async sendRegistrationVerification(
    toEmail: string,
    link: string
  ) {
    this.lastMailTo = toEmail;
    this.lastMailLink = link;
  }

  async sendRegistrationApprovalRequest(
    approverEmail: string,
    registrationToApprove: RegistrationRecord,
    approvalLink: string
  ) {
    this.lastMailTo = approverEmail;
    this.lastMailLink = approvalLink;
    this.lastMailData = {
      exchangeName: registrationToApprove.institutionName,
      registrationEmail: registrationToApprove.email
    };
  }

  async sendRegistrationUpdated(
    registration: RegistrationRecord
  ) {
    this.lastMailTo = registration.email;
    this.lastMailData = registration;
  }
}
