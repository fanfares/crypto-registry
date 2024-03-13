import { FundingSubmissionDto } from '../open-api';

export type FundingMode = 'showForm' | 'showPending' | 'showCurrent';

export interface FundingStore {
  isProcessing: boolean;
  isWorking: boolean;
  mode: FundingMode;
  errorMessage: string | null;
  clearFundingErrorMessage: () => void
  pendingSubmission: FundingSubmissionDto | null,
  currentSubmission: FundingSubmissionDto | null,

  setMode: (mode: FundingMode) => void,
  cancelPending: () => Promise<void>,
  createFundingSubmission: (
    addressFile: File,
    resetFunding: boolean
  ) => Promise<FundingSubmissionDto | null>;
  loadCurrentSubmission: () => Promise<void>,
  pollPendingSubmission: () => Promise<void>,
  getFundingSubmissions: () => Promise<FundingSubmissionDto[]>
  downloadExampleFile: () => Promise<void>
}
