import { CredentialsDto, SubmissionDto, AmountSentBySenderDto } from '../open-api';

export interface Store {
  errorMessage: string | null;
  isWorking: boolean;
  currentSubmission: SubmissionDto | null;
  paymentStatus: AmountSentBySenderDto | null,
  docsUrl: string;
  customerEmail: string;
  nodeName: string,
  nodeAddress: string,
  institutionName: string;

  signIn: (credentials: CredentialsDto) => void;
  signOut: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOutTimer: any | null;

  init: () => void
  setCustomerEmail: (email: string) => void,
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
  refreshSubmissionStatus: () => Promise<void>;
  createSubmission: (
    file: File,
    exchangeName: string,
    exchangeZpub: string,
  ) => void;
  setSubmission: (submissionDto: SubmissionDto) => void,
  loadSubmission: (address: string) => Promise<SubmissionDto | null>,
  cancelSubmission: () => Promise<void>;
  clearSubmission: () => void
  validateZpub: (zpub: string) => Promise<boolean | string>
  getPaymentStatus: () => Promise<void>
  setSignInExpiry: () => void
}

