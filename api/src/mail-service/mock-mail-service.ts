import { IMailService, VerifiedHoldings } from './mail.service.interface';
import { RegistrationRecord } from '../types/registration.db';

export class MockMailService implements IMailService {
  lastEmail: any;
  link: string;
  lastVerificationEmail: {
    toEmail: string;
    verifiedHoldings: VerifiedHoldings[];
  };

  async sendTestEmail(toEmail: string, name: string) {
    this.lastEmail = {
      toEmail,
      name
    };
  }

  async sendVerificationEmail(
    toEmail: string,
    verifiedHoldings: VerifiedHoldings[]
  ) {
    this.lastVerificationEmail = { toEmail, verifiedHoldings };
  }

  sendRegistrationApprovalRequest(
    toEmail: string,
    registrationToApprove: RegistrationRecord,
    link: string): Promise<void> {
    this.link = link;
    return Promise.resolve(undefined);
  }

  sendRegistrationUpdated(
    registration: RegistrationRecord
  ): Promise<void> {
    return Promise.resolve(undefined);
  }

  sendRegistrationVerification(
    toEmail: string, link: string
  ): Promise<void> {
    this.link = link;
    return Promise.resolve(undefined);
  }
}
