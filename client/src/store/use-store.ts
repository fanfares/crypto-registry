import create, { StateCreator } from 'zustand';
import { Store } from './store';
import { persist } from 'zustand/middleware';
import axios, { AxiosError } from 'axios';
import {
  ApiError,
  CredentialsDto,
  CryptoService,
  Network,
  SubmissionService,
  SubmissionStatusDto,
  SystemService
} from '../open-api';


const creator: StateCreator<Store> = (set, get) => ({
  errorMessage: null,
  submissionStatus: null,
  isWorking: false,
  docsUrl: '',
  customerEmail: '',
  network: Network.TESTNET,
  credentials: null,
  isAuthenticated: false,

  setNetwork: (network: Network) => {
    set({ 'network': network });
  },

  init: async () => {
    set({ errorMessage: null, isWorking: true });
    try {
      const data = await SystemService.getSystemConfig();
      set({ docsUrl: data.docsUrl, isWorking: false });
    } catch (err) {
      set({ errorMessage: err.message, isWorking: false });
    }
  },

  setCustomerEmail: (email: string) => {
    set({ customerEmail: email });
  },

  setErrorMessage: (errorMessage) => {
    set({ errorMessage: errorMessage });
  },

  clearErrorMessage: () => {
    set({ errorMessage: null });
  },

  refreshSubmissionStatus: async () => {
    if (!get().submissionStatus) {
      return;
    }
    set({ isWorking: true, errorMessage: '' });
    setTimeout(async () => {
      try {
        const status = get().submissionStatus;
        if (status) {
          set({ submissionStatus: await SubmissionService.getSubmissionStatus(status.paymentAddress) });
        }
        set({ isWorking: false });
      } catch (err) {
        let errorMessage = err.message;
        if (err instanceof ApiError) {
          errorMessage = err.body.message;
        }
        set({ errorMessage, isWorking: false });
      }
    }, 1000);
  },

  createSubmission: async (
    file: File,
    exchangeName: string,
    exchangeZpub: string
  ) => {
    set({ errorMessage: null, isWorking: true, submissionStatus: null });
    try {
      const formData = new FormData();
      formData.append('File', file);
      formData.append('exchangeName', exchangeName);
      formData.append('exchangeZpub', exchangeZpub);
      formData.append('network', get().network);
      const result = await axios.post<SubmissionStatusDto>('/api/submission/submit-csv', formData);
      set({ submissionStatus: result.data, isWorking: false });
    } catch (err) {
      let message = err.message;
      if (err instanceof AxiosError) {
        message = err.response?.data.message;
      }
      set({ errorMessage: message, isWorking: false });
    }
  },

  loadSubmission: async (address: string): Promise<SubmissionStatusDto | null> => {
    set({ errorMessage: null, isWorking: true, submissionStatus: null });
    try {
      const result = await SubmissionService.getSubmissionStatus(address);
      set({ submissionStatus: result, isWorking: false });
      return result;
    } catch (err) {
      let errorMessage = err.message;
      if (err instanceof ApiError) {
        errorMessage = err.body.message;
      }
      set({ errorMessage, isWorking: false });
    }
    return null;
  },

  cancelSubmission: async () => {
    set({ errorMessage: null, isWorking: true });
    try {
      const address = get().submissionStatus?.paymentAddress;
      if (address) {
        await SubmissionService.cancelSubmission({ address });
      }
      set({ submissionStatus: null, isWorking: false });
    } catch (err) {
      let errorMessage = err.message;
      if (err instanceof ApiError) {
        errorMessage = err.body.message;
      }
      set({ errorMessage, isWorking: false });
    }
  },

  clearSubmission: () => {
    set({ errorMessage: null, submissionStatus: null, isWorking: false });
  },

  validateZpub: async (zpub: string): Promise<boolean | string> => {
    set({ isWorking: false, errorMessage: null });
    try {
      const result = await CryptoService.validateZpub(zpub);
      return result.isValid ? true : 'Invalid public key';
    } catch (err) {
      if (err.status === 403) {
        return 'You must be signed in to use this service';
      }
      if (err instanceof ApiError && err.status === 400) {
        return err.body.message;
      }
      return 'Unable to validate public key';
    }
  },

  signIn: (credentials: CredentialsDto) => {
    set({ credentials, isAuthenticated: true });
  },

  signOut: () => {
    set({
      credentials: null,
      isAuthenticated: false,
      submissionStatus: null,
      isWorking: false,
      errorMessage: null
    });
  }
});

export const useStore = create<Store>()(
  persist(creator, {
    name: 'submission-store'
  })
);
