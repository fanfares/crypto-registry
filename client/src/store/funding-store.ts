import { FundingSubmissionDto } from '../open-api';

export interface FundingStore {
  isWorking: boolean;
  updateMode: boolean;
  errorMessage: string | null;
  signingMessage: string | null;
  pinnedSubmission: FundingSubmissionDto | null,
  currentSubmission: FundingSubmissionDto | null,

  startUpdate: () => void,
  clearUpdate: () => void,
  cancelUpdate: () => Promise<void>,
  createFundingSubmission: (
    addressFile: File
  ) => Promise<FundingSubmissionDto | null>;
  loadCurrentSubmission: () => Promise<void>,
  updateSubmission: (submission: FundingSubmissionDto) => void,
  updateSigningMessage: () => Promise<void>,
  getFundingSubmissions: () => Promise<FundingSubmissionDto[]>
}
