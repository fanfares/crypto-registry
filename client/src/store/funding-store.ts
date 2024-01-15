import { FundingSubmissionDto } from '../open-api';

export type FundingMode = 'showForm' | 'showPending' | 'showCurrent';

export interface FundingStore {
  isWorking: boolean;
  mode: FundingMode;
  errorMessage: string | null;
  signingMessage: string | null;
  pendingSubmission: FundingSubmissionDto | null,
  currentSubmission: FundingSubmissionDto | null,

  startUpdate: () => void,
  clearUpdate: () => void,
  cancelUpdate: () => Promise<void>,
  createFundingSubmission: (
    addressFile: File
  ) => Promise<FundingSubmissionDto | null>;
  loadCurrentSubmission: () => Promise<void>,
  pollPendingSubmission: () => Promise<void>,
  updateSigningMessage: () => Promise<void>,
  getFundingSubmissions: () => Promise<FundingSubmissionDto[]>
}
