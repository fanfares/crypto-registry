import create, { StateCreator } from 'zustand';
import { Store } from './store';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { SubmissionStatusDto, SubmissionService, ApiError, SystemService } from '../open-api';


const creator: StateCreator<Store> = (set, get) => ({
  errorMessage: null,
  submissionStatus: null,
  isWorking: false,
  docsUrl: '',
  customerEmail: '',

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
    set({customerEmail: email})
  },

  setErrorMessage: (errorMessage) => {
    set({ errorMessage: errorMessage });
  },

  clearErrorMessage: () => {
    set({ errorMessage: null });
  },

  refreshSubmissionStatus: async () => {
    if (!get().submissionStatus) {
      throw new Error('Cannot refresh');
    }
    try {
      set({ isWorking: true });
      const status = get().submissionStatus;
      if (status) {
        set({ submissionStatus: await SubmissionService.getSubmissionStatus(status.paymentAddress) });
      }
      set({ isWorking: false });
    } catch (err) {
      let errorMessage = err.message
      if ( err instanceof ApiError) {
        errorMessage = err.body.message
      }
      set({ errorMessage, isWorking: false });
    }
  },

  sendSubmission: async (file: File, exchangeName: string) => {
    set({ errorMessage: null, isWorking: true });
    try {
      const formData = new FormData();
      formData.append('File', file);
      formData.append('exchangeName', exchangeName);
      const result = await axios.post<SubmissionStatusDto>('/api/submission/submit-csv', formData);
      set({ submissionStatus: result.data, isWorking: false });
    } catch (err) {
      set({ errorMessage: err.message, isWorking: false });
    }
  },

  loadSubmission: async (address: string): Promise<SubmissionStatusDto | null > => {
    set({ errorMessage: null, isWorking: true, submissionStatus: null });
    try {
      const result = await SubmissionService.getSubmissionStatus(address)
      set({ submissionStatus: result, isWorking: false });
      return result
    } catch (err ) {
      let errorMessage = err.message
      if ( err instanceof ApiError) {
        errorMessage = err.body.message
      }
      set({ errorMessage, isWorking: false });
    }
    return null;
  },

  cancelSubmission: async () => {
    set({ errorMessage: null, isWorking: true });
    try {
      const address = get().submissionStatus?.paymentAddress;
      if ( address ) {
        await SubmissionService.cancelSubmission({ address });
      }
      set({ submissionStatus: null, isWorking: false });
    } catch (err) {
      set({ errorMessage: err.message, isWorking: false });
    }
  },

  clearSubmission: () => {
    set({errorMessage: null, submissionStatus: null, isWorking: false})
  }
});

export const useStore = create<Store>()(
  persist(creator, {
    name: 'submission-store'
  })
);
