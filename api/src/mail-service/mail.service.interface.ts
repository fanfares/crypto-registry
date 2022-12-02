export interface VerifiedHoldings {
  customerHoldingAmount: number;
  exchangeName: string;
}

export interface IMailService {
  sendTestEmail(toEmail: string, name: string);

  sendVerificationEmail(toEmail: string, verifiedHoldings: VerifiedHoldings[]);
}
