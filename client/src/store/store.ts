import { CredentialsDto, ExchangeDto, ExtendedKeyValidationResult } from '../open-api';

export interface Store {
  errorMessage: string | null;
  isWorking: boolean;
  currentExchange: ExchangeDto | null;
  docsUrl: string;
  customerEmail: string;
  nodeName: string,
  nodeAddress: string,
  institutionName: string;

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
  validateExtendedKey: (zpub: string) => Promise<ExtendedKeyValidationResult>;
  setSignInExpiry: () => void;

  setExchange: (exchange: ExchangeDto) => void;
}

