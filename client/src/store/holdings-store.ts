import { HoldingsSubmissionDto, Network } from '../open-api';

export interface HoldingsStore {
  errorMessage: string | null;
  isWorking: boolean;
  currentHoldings: HoldingsSubmissionDto | null;
  editMode: boolean;

  startEdit: () => void,
  clearEdit: () => void

  createHoldingsSubmission: (
    holdingsFile: File,
    network: Network
  ) => Promise<HoldingsSubmissionDto | null>;

  getHoldingsSubmissions: () => Promise<HoldingsSubmissionDto[]>;
  loadCurrentHoldings: () => Promise<void>
}

