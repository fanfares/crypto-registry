import create, { StateCreator } from 'zustand';
import { Store } from './store';
import { persist } from 'zustand/middleware';
import {
  FundingSubmissionDto,
  FundingSubmissionService,
  BitcoinService,
  CredentialsDto,
  ExchangeService,
  ExtendedKeyValidationResult,
  HoldingsSubmissionDto,
  HoldingsSubmissionService,
  Network,
  SystemService
} from '../open-api';

import { request } from '../open-api/core/request';
import { getApiErrorMessage } from '../utils/get-api-error-message';
import { ApiError, OpenAPI } from '../open-api/core';


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

  updateSigningMessage: async () => {
    const signingMessage = await FundingSubmissionService.getSigningMessage();
    set({
      signingMessage: signingMessage
    });
  },

  init: async () => {
    set({errorMessage: null, isWorking: true});
    try {
      const data = await SystemService.getSystemConfig();
      const token = localStorage.getItem('token');
      const signingMessage = await FundingSubmissionService.getSigningMessage();
      const exchange = await ExchangeService.getUserExchange();
      set({
        currentExchange: exchange,
        isAuthenticated: !!token,
        docsUrl: data.docsUrl,
        isWorking: false,
        nodeName: data.nodeName,
        nodeAddress: data.nodeAddress,
        institutionName: data.institutionName,
        signingMessage: signingMessage
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
  //
  // refreshSubmissionStatus: async () => {
  //   if (!get().currentSubmission) {
  //     return;
  //   }
  //   set({isWorking: true, errorMessage: ''});
  //   setTimeout(async () => {
  //     try {
  //       const status = get().currentSubmission;
  //       if (status) {
  //         set({currentSubmission: await SubmissionService.getSubmission(status._id)});
  //       }
  //       set({isWorking: false});
  //     } catch (err) {
  //       let errorMessage = err.message;
  //       if (err instanceof ApiError) {
  //         errorMessage = err.body.message;
  //       }
  //       set({errorMessage, isWorking: false});
  //     }
  //   }, 1000);
  // },
  //
  // setSubmission: (submissionDto: SubmissionDto) => {
  //   if (submissionDto._id === get().currentSubmission?._id) {
  //     set({
  //       currentSubmission: submissionDto
  //     });
  //   }
  // },

  createFundingSubmission: async (
    addressFile: File,
    network: Network
  ) => {
    set({errorMessage: null, isWorking: true});
    try {
      const formData = new FormData();
      formData.append('addressFile', addressFile);
      formData.append('signingMessage', get().signingMessage ?? '');
      const result: FundingSubmissionDto = await request(OpenAPI, {
        method: 'POST',
        url: '/api/funding-submission/submit-csv',
        formData: formData
      });
      set({isWorking: false});
      return result;
    } catch (err) {
      let message = err.toString();
      if (err instanceof ApiError) {
        message = err.body?.message;
      }
      set({errorMessage: message, isWorking: false});
      return null;
    }
  },

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
      let message = err.toString();
      if (err instanceof ApiError) {
        message = err.body?.message;
      }
      set({errorMessage: message, isWorking: false});
      return null;
    }
  },
  //
  // loadSubmission: async (submissionId: string): Promise<SubmissionDto | null> => {
  //   set({errorMessage: null, isWorking: true, currentSubmission: null});
  //   try {
  //     const submissionDto = await SubmissionService.getSubmission(submissionId);
  //     set({
  //       currentSubmission: submissionDto,
  //       errorMessage: !submissionDto ? 'Unknown payment address' : null,
  //       isWorking: false
  //     });
  //     return submissionDto;
  //   } catch (err) {
  //     const errorMessage = getApiErrorMessage(err);
  //     set({errorMessage, isWorking: false});
  //   }
  //   return null;
  // },
  //
  // cancelSubmission: async () => {
  //   set({errorMessage: null, isWorking: true});
  //   try {
  //     const submissionId = get().currentSubmission?._id;
  //     if (submissionId) {
  //       await SubmissionService.cancelSubmission({id: submissionId});
  //     }
  //     set({currentSubmission: null, isWorking: false});
  //   } catch (err) {
  //     let errorMessage = err.message;
  //     if (err instanceof ApiError) {
  //       errorMessage = err.body.message;
  //     }
  //     set({errorMessage, isWorking: false});
  //   }
  // },
  //
  // clearSubmission: () => {
  //   set({
  //     errorMessage: null,
  //     currentSubmission: null,
  //     isWorking: false
  //   });
  // },

  validateExtendedKey: async (key: string): Promise<ExtendedKeyValidationResult> => {
    set({isWorking: false, errorMessage: null});
    try {
      return await BitcoinService.validateExtendedKey(key);
    } catch (err) {
      set({errorMessage: getApiErrorMessage(err), isWorking: false});
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
  }

});

export const useStore = create<Store>()(
  persist(creator, {
    name: 'submission-store'
  })
);
