import { SubmissionStatusDto } from '../open-api';

export interface Store {
  errorMessage: string | null;
  isWorking: boolean;
  submissionStatus: SubmissionStatusDto | null;
  docsUrl: string;

  init:() => void
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
  refreshSubmissionStatus: () => void;
  sendSubmission: (file: File, exchangeName: string) => void;
  loadSubmission: (address: string) => void
  cancelSubmission: () => void;
  clearSubmission: () => void
}

