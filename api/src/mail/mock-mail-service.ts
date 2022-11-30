export class MockMailService {
  lastEmail: any;

  async sendTestEmail(toEmail: string, name: string) {
    this.lastEmail = {
      toEmail,
      name,
    };
  }

  async sendVerificationEmail(
    toEmail: string,
    customerHoldingAmount: number,
    custodianName: string,
  ) {
    this.lastEmail = { toEmail, customerHoldingAmount, custodianName };
  }
}
