import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiConfigService } from '../api-config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SendMailService {
  constructor(
    private mailerService: MailerService,
    private apiConfigService: ApiConfigService,
    private logger: Logger
  ) {
  }

  async sendMail(mailData: ISendMailOptions) {
    if (!this.apiConfigService.isEmailEnabled) {
      this.logger.warn('Email is disabled', {mailOptions: mailData});
      return;
    }
    this.logger.debug('Sending email', mailData);
    await this.mailerService.sendMail(mailData);
  }
}
