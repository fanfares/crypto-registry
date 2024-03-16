import { FundingSubmissionStatusDto } from '../open-api';

export type FundingMode = 'showForm' | 'showPending' | 'showCurrent';

export interface FundingStore {
  isProcessing: boolean;
  isWorking: boolean;
  mode: FundingMode;
  errorMessage: string | null;
  clearFundingErrorMessage: () => void;
  fundingSubmissionStatus: FundingSubmissionStatusDto | null;

  setMode: (mode: FundingMode) => void;
  cancelPending: () => Promise<void>;
  createFundingSubmission: (
    addressFile: File,
    resetFunding: boolean
  ) => Promise<void>;
  updateSubmissionStatus: () => Promise<void>;
  downloadExampleFile: () => Promise<void>;
  deleteAddress: (address: string) => Promise<void>
}
