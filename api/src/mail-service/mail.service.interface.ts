import { RegistrationRecord } from '../types/registration.db';

export interface VerifiedHoldings {
  customerHoldingAmount: number;
  exchangeName: string;
}

export interface IMailService {
  sendTestEmail(
    toEmail: string,
    name: string
  ): Promise<void>;

  sendVerificationEmail(
    toEmail: string,
    verifiedHoldings: VerifiedHoldings[],
    verificationNodeName: string,
    verificationNodeAddress: string
  ): Promise<void>;

  sendRegistrationVerification(
    toEmail: string,
    link: string
  ): Promise<void>;

  sendRegistrationApprovalRequest(
    toEmail: string,
    registrationToApprove: RegistrationRecord,
    link: string
  ): Promise<void>;

  sendRegistrationUpdated(
    registration: RegistrationRecord
  ): Promise<void>;
}
