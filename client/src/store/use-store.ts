import create, { StateCreator } from 'zustand';
import { Store } from './store';
import { persist } from 'zustand/middleware';
import {
  BitcoinService,
  CredentialsDto,
  ExchangeDto,
  ExchangeService,
  ExtendedKeyValidationResult,
  FundingSubmissionDto,
  FundingSubmissionService,
  HoldingsSubmissionDto,
  HoldingsSubmissionService,
  Network,
  SystemService
} from '../open-api';

import { request } from '../open-api/core/request';
import { OpenAPI } from '../open-api/core';


const creator: StateCreator<Store> = (set, get) => ({
  errorMessage: null,
  currentExchange: null,
  isWorking: false,
  paymentStatus: null,
  docsUrl: '',
  customerEmail: '',
  network: Network.TESTNET,
  isAuthenticated: false,
  nodeName: '',
  nodeAddress: '',
  institutionName: '',
  isAdmin: false,
  signOutTimer: null,
  signingMessage: null,

  getFundingSubmissions: async (): Promise<FundingSubmissionDto[]> => {
    return FundingSubmissionService.getSubmissions();
  },

  getHoldingsSubmissions: async (): Promise<HoldingsSubmissionDto[]> => {
    return HoldingsSubmissionService.getSubmissions();
  },

  init: async () => {
    set({errorMessage: null, isWorking: true});
    try {
      const data = await SystemService.getSystemConfig();
      const token = localStorage.getItem('token');
      // const signingMessage = await FundingSubmissionService.getSigningMessage();
      const exchange = await ExchangeService.getUserExchange();
      set({
        currentExchange: exchange,
        isAuthenticated: !!token,
        docsUrl: data.docsUrl,
        isWorking: false,
        nodeName: data.nodeName,
        nodeAddress: data.nodeAddress,
        institutionName: data.institutionName,
        // signingMessage: signingMessage
      });

    } catch (err) {
      set({errorMessage: err.message, isWorking: false});
    }
  },

  setCustomerEmail: (email: string) => {
    set({customerEmail: email});
  },

  setErrorMessage: (errorMessage) => {
    set({errorMessage: errorMessage});
  },

  clearErrorMessage: () => {
    set({errorMessage: null});
  },

  // createFundingSubmission: async (
  //   addressFile: File
  // ) => {
  //   set({errorMessage: null, isWorking: true});
  //   try {
  //     const formData = new FormData();
  //     formData.append('addressFile', addressFile);
  //     formData.append('signingMessage', get().signingMessage ?? '');
  //     const result: FundingSubmissionDto = await request(OpenAPI, {
  //       method: 'POST',
  //       url: '/api/funding-submission/submit-csv',
  //       formData: formData
  //     });
  //     set({isWorking: false});
  //     return result;
  //   } catch (err) {
  //     set({errorMessage: err.message, isWorking: false});
  //     return null;
  //   }
  // },

  createHoldingsSubmission: async (
    holdingsFiles: File,
    network: Network
  ) => {
    set({errorMessage: null, isWorking: true});
    try {
      const formData = new FormData();
      formData.append('holdingsFile', holdingsFiles);
      formData.append('network', network);
      const result: HoldingsSubmissionDto = await request(OpenAPI, {
        method: 'POST',
        url: '/api/holdings-submission/submit-csv',
        formData: formData
      });
      set({isWorking: false});
      return result;
    } catch (err) {
      set({errorMessage: err.message, isWorking: false});
      return null;
    }
  },

  validateExtendedKey: async (key: string): Promise<ExtendedKeyValidationResult> => {
    set({isWorking: false, errorMessage: null});
    try {
      return await BitcoinService.validateExtendedKey(key);
    } catch (err) {
      set({errorMessage: err.message, isWorking: false});
      return {
        valid: false
      };
    }
  },

  signIn: (credentials: CredentialsDto) => {
    localStorage.setItem('token', credentials.idToken);
    localStorage.setItem('token-expiry', credentials.idTokenExpiry);
    set({
      isAuthenticated: true,
      isAdmin: credentials.isAdmin
    });
    get().setSignInExpiry();
  },

  signOut: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token-expiry');
    set({
      isAuthenticated: false,
      isAdmin: false,
      isWorking: false,
      errorMessage: null
    });
    if (get().signOutTimer) clearTimeout(get().signOutTimer);
  },

  setSignInExpiry: () => {
    if (get().signOutTimer) {
      clearTimeout(get().signOutTimer);
    }
    set({
      signOutTimer: setTimeout(() => {
        get().signOut();
      }, 3600 * 1000)
    });
  },

  setExchange: (exchange: ExchangeDto) => {
    set({currentExchange: exchange});
  }
});

export const useStore = create<Store>()(
  persist(creator, {
    name: 'submission-store'
  })
);
