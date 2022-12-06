import { IMailService, VerifiedHoldings } from './mail.service.interface';

export class MockMailService implements IMailService {
  lastTestEmail: any;
  lastVerificationEmail: {
    toEmail: string;
    verifiedHoldings: VerifiedHoldings[];
  };

  async sendTestEmail(toEmail: string, name: string) {
    this.lastTestEmail = {
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
}
