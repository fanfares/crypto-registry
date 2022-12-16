import { SubmissionStatusDto } from '../open-api';

export interface Store {
  errorMessage: string | null;
  isWorking: boolean;
  submissionStatus: SubmissionStatusDto | null;
  docsUrl: string;
  customerEmail: string;

  init:() => void
  setCustomerEmail: (email: string) => void,
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
  refreshSubmissionStatus: () => Promise<void>;
  createSubmission: (file: File, exchangeName: string, exchangeZpub: string) => void;
  loadSubmission: (address: string) => Promise<SubmissionStatusDto | null>,
  cancelSubmission: () => Promise<void>;
  clearSubmission: () => void
}

