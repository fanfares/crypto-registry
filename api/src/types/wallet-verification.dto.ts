export enum VerificationResult {
  EMAIL_SENT = 'email-sent',
  FAILED_TO_SEND_EMAIL = 'failed-to-send-email',
  CANT_FIND_VERIFIED_HOLDING = 'cant-find-verified-holding'
}

export class VerificationDto {
  verificationResult: VerificationResult;
}
