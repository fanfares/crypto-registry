import { SubmissionStatusDto } from '../open-api';

export interface Store {
  errorMessage: string | null;
  isWorking: boolean;
  submissionStatus: SubmissionStatusDto | null;

  refreshSubmissionStatus: () => void;
  sendSubmission: (file: File, exchangeName: string) => void;
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
}

