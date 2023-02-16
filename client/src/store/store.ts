import { CredentialsDto, Network, SubmissionStatusDto } from '../open-api';

export interface Store {
  errorMessage: string | null;
  isWorking: boolean;
  submissionStatus: SubmissionStatusDto | null;
  docsUrl: string;
  customerEmail: string;
  network: Network

  credentials: CredentialsDto | null;
  signIn: (credentials: CredentialsDto) => void;
  signOut: () => void;
  isAuthenticated: boolean

  setNetwork: (network: Network) => void,
  init: () => void
  setCustomerEmail: (email: string) => void,
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
  refreshSubmissionStatus: () => Promise<void>;
  createSubmission: (file: File, exchangeName: string, exchangeZpub: string) => void;
  loadSubmission: (address: string) => Promise<SubmissionStatusDto | null>,
  cancelSubmission: () => Promise<void>;
  clearSubmission: () => void
  validateZpub: (zpub: string) => Promise<boolean|string>
}

