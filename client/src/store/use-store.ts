import create from 'zustand';
import { Store } from './store';
import { ExchangeService, SubmissionStatusDto } from '../open-api';
import axios from 'axios';

export const useStore = create<Store>((set, get) => ({
  errorMessage: null,
  submissionStatus: null,
  isWorking: false,

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
        set({ submissionStatus: await ExchangeService.getSubmissionStatus(status.paymentAddress) });
      }
      set({ isWorking: false });
    } catch (err) {
      set({ errorMessage: err.message, isWorking: false });
    }
  },

  sendSubmission: async (file: File, exchangeName: string) => {
    set({ errorMessage: null, isWorking: true });
    try {
      const formData = new FormData();
      formData.append('File', file);
      formData.append('exchangeName', exchangeName);
      const result = await axios.post<SubmissionStatusDto>('/api/exchange/submit-holdings-csv', formData);
      set({ submissionStatus: result.data, isWorking: false });
    } catch (err) {
      set({ errorMessage: err.message, isWorking: false });
    }
  }
}));
