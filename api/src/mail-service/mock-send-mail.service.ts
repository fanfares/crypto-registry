import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { SentMessageInfo } from 'nodemailer';
import { SendMailService } from './send-mail-service';

export class MockSendMailService extends SendMailService {
  lastSentMail: ISendMailOptions;

  constructor() {
    super(null, null, null);
  }

  sendMail(sendMailOptions: ISendMailOptions): Promise<SentMessageInfo> {
    this.lastSentMail = sendMailOptions;
    return;
  }

  getLastToEmail() {
    return this.lastSentMail.to;
  }

  getVal(name: string) {
    return this.lastSentMail.context[name];
  }

  get noEmailSent() {
    return !this.lastSentMail;
  }

  get link() {
    return this.getVal('link');
  }

}
