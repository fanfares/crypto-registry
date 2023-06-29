import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { SentMessageInfo } from 'nodemailer';
import { SendMailService } from './send-mail-service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockSendMailService extends SendMailService {
  lastSentMail: ISendMailOptions = null;

  constructor() {
    super(null, null, null);
  }

  sendMail(sendMailOptions: ISendMailOptions): Promise<SentMessageInfo> {
    this.lastSentMail = sendMailOptions;
    return;
  }

  getLastToEmail() {
    return this.lastSentMail?.to ?? null;
  }

  getVal(name: string) {
    return this.lastSentMail?.context[name] ?? null;
  }

  get noEmailSent() {
    return !this.lastSentMail;
  }

  reset() {
    this.lastSentMail = null;
  }

  get link() {
    return this.getVal('link');
  }

}
