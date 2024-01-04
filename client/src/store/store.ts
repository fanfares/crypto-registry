import {
  FundingSubmissionDto,
  CredentialsDto,
  ExchangeDto,
  ExtendedKeyValidationResult,
  HoldingsSubmissionDto,
  Network
} from '../open-api';

export interface Store {
  errorMessage: string | null;
  isWorking: boolean;
  currentExchange: ExchangeDto | null;
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
  // eslint-disable-next-line
  signOutTimer: any | null;

  init: () => void
  setCustomerEmail: (email: string) => void,
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
  // refreshSubmissionStatus: () => Promise<void>;
  createFundingSubmission: (
    addressFile: File,
    network: Network
  ) => Promise<FundingSubmissionDto | null>;
  createHoldingsSubmission: (
    holdingsFile: File,
    network: Network
  ) => Promise<HoldingsSubmissionDto | null >;

  getFundingSubmissions(): Promise<FundingSubmissionDto[]>

  getHoldingsSubmissions(): Promise<HoldingsSubmissionDto[]>

  // setFundingSubmission: (submissionDto: SubmissionDto) => void,
  // loadFundingSubmission: (id: string) => Promise<FundingSubmissionDto | null>,
  // cancelFundingSubmission: (id: string) => Promise<void>;
  // clearSubmission: () => void;
  validateExtendedKey: (zpub: string) => Promise<ExtendedKeyValidationResult>;
  setSignInExpiry: () => void;
  updateSigningMessage: () => Promise<void>;
}

