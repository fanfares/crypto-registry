import create, { StateCreator } from 'zustand';
import { Store } from './store';
import { persist } from 'zustand/middleware';
import {
  ApiError,
  BitcoinService,
  CredentialsDto,
  Network,
  OpenAPI,
  SubmissionDto,
  SubmissionService,
  SystemService,
  ZpubValidationResult
} from '../open-api';
import { request } from '../open-api/core/request';
import { getApiErrorMessage } from '../utils/get-api-error-message';


const creator: StateCreator<Store> = (set, get) => ({
  errorMessage: null,
  currentSubmission: null,
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

  init: async () => {
    set({errorMessage: null, isWorking: true});
    try {
      const data = await SystemService.getSystemConfig();
      const token = localStorage.getItem('token');
      set({
        isAuthenticated: !!token,
        docsUrl: data.docsUrl,
        isWorking: false,
        nodeName: data.nodeName,
        nodeAddress: data.nodeAddress,
        institutionName: data.institutionName
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

  refreshSubmissionStatus: async () => {
    if (!get().currentSubmission) {
      return;
    }
    set({isWorking: true, errorMessage: ''});
    setTimeout(async () => {
      try {
        const status = get().currentSubmission;
        if (status) {
          set({currentSubmission: await SubmissionService.getSubmission(status._id)});
        }
        set({isWorking: false});
      } catch (err) {
        let errorMessage = err.message;
        if (err instanceof ApiError) {
          errorMessage = err.body.message;
        }
        set({errorMessage, isWorking: false});
      }
    }, 1000);
  },

  setSubmission: (submissionDto: SubmissionDto) => {
    if (submissionDto._id === get().currentSubmission?._id) {
      set({
        currentSubmission: submissionDto
      });
    }
  },

  createSubmission: async (
    file: File,
    network: Network,
    exchangeName: string,
    exchangeZpubs: string[]
  ) => {
    set({errorMessage: null, isWorking: true, currentSubmission: null});
    try {
      const formData = new FormData();
      formData.append('File', file);
      formData.append('network', network);
      formData.append('exchangeName', exchangeName);
      exchangeZpubs.forEach(exchangeZpub => {
        formData.append('exchangeZpubs[]', exchangeZpub);
      });
      const result: SubmissionDto = await request(OpenAPI, {
        method: 'POST',
        url: '/api/submission/submit-csv',
        formData: formData
      });
      set({currentSubmission: result, isWorking: false});
    } catch (err) {
      let message = err.toString();
      if (err instanceof ApiError) {
        message = err.body?.message;
      }
      set({errorMessage: message, isWorking: false});
    }
  },

  loadSubmission: async (submissionId: string): Promise<SubmissionDto | null> => {
    set({errorMessage: null, isWorking: true, currentSubmission: null});
    try {
      const submissionDto = await SubmissionService.getSubmission(submissionId);
      set({
        currentSubmission: submissionDto,
        errorMessage: !submissionDto ? 'Unknown payment address' : null,
        isWorking: false
      });
      return submissionDto;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      set({errorMessage, isWorking: false});
    }
    return null;
  },

  cancelSubmission: async () => {
    set({errorMessage: null, isWorking: true});
    try {
      const submissionId = get().currentSubmission?._id;
      if (submissionId) {
        await SubmissionService.cancelSubmission({id: submissionId});
      }
      set({currentSubmission: null, isWorking: false});
    } catch (err) {
      let errorMessage = err.message;
      if (err instanceof ApiError) {
        errorMessage = err.body.message;
      }
      set({errorMessage, isWorking: false});
    }
  },

  clearSubmission: () => {
    set({
      errorMessage: null,
      currentSubmission: null,
      isWorking: false
    });
  },

  validateZpub: async (zpub: string): Promise<ZpubValidationResult> => {
    set({isWorking: false, errorMessage: null});
    try {
      return await BitcoinService.validateZpub(zpub);
    } catch (err) {
      set({errorMessage: getApiErrorMessage(err), isWorking: false});
      return {
        valid: false
      }
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
      currentSubmission: null,
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
