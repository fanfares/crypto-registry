import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { SentMessageInfo } from 'nodemailer';
import { SendMailService } from './send-mail-service';
import { Injectable } from '@nestjs/common';
import { MailService } from './mail.service';
import { render } from '@react-email/render';
import { ExchangeUserInviteEmail } from './components/exchange-user-invite-email';
import { getTokenFromLink } from '../utils/get-token-from-link';
import { VerifiedHoldings } from '@bcr/types';

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
    return this.lastMailLink
  }

  get token() {
    return getTokenFromLink(this.lastMailLink)
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
    this.lastMailData = { verifiedHoldings, institutionName }
  }
}
