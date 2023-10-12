import { CredentialsDto, ExtendedKeyValidationResult, Network, SubmissionDto } from '../open-api';

export interface Store {
  errorMessage: string | null;
  isWorking: boolean;
  currentSubmission: SubmissionDto | null;
  docsUrl: string;
  customerEmail: string;
  nodeName: string,
  nodeAddress: string,
  institutionName: string;
  signingMessage: string | null;

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
    holdingsFile: File,
    addressFile: File,
    network: Network,
    exchangeName: string
  ) => Promise<void>;
  setSubmission: (submissionDto: SubmissionDto) => void,
  loadSubmission: (address: string) => Promise<SubmissionDto | null>,
  cancelSubmission: () => Promise<void>;
  clearSubmission: () => void
  validateExtendedKey: (zpub: string) => Promise<ExtendedKeyValidationResult>
  setSignInExpiry: () => void
}

