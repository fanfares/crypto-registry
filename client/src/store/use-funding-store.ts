import { create, StateCreator } from 'zustand';
import { FundingAddressService, FundingSubmissionService, FundingSubmissionStatusDto } from '../open-api';
import { persist } from 'zustand/middleware';
import { request } from '../open-api/core/request';
import { OpenAPI } from '../open-api/core';
import { getErrorMessage } from '../utils';
import { downloadFileFromApi } from '../open-api/core/download-file-from-api.ts';
import { useStore } from './use-store.ts';

export type FundingMode = 'showForm' | 'showPending' | 'showCurrent';

export interface UseFundingStore {
  isProcessing: boolean;
  isWorking: boolean;
  mode: FundingMode;
  errorMessage: string | null;
  clearFundingErrorMessage: () => void;
  fundingStatus: FundingSubmissionStatusDto | null;

  setMode: (mode: FundingMode) => void;
  cancelPending: () => Promise<void>;
  createFundingSubmission: (
    addressFile: File,
    resetFunding: boolean
  ) => Promise<void>;
  updateFundingStatus: () => Promise<void>;
  downloadExampleFile: () => Promise<void>;
  deleteAddress: (address: string) => Promise<void>,
  refreshExchangeBalances: (exchangeId: string) => Promise<void>
}

const creator: StateCreator<UseFundingStore> = (set) => ({
  isProcessing: false,
  errorMessage: null,
  mode: 'showCurrent',
  fundingStatus: null,

  isWorking: false,

  clearFundingErrorMessage: () => {
    set({errorMessage: ''});
  },

  setMode: (mode: FundingMode) => {
    set({mode: mode});
  },

  createFundingSubmission: async (
    addressFile: File,
    resetFunding: boolean
  ): Promise<void> => {
    set({
      errorMessage: null,
      isProcessing: true,
      isWorking: true
    });
    try {
      const formData = new FormData();
      formData.append('addressFile', addressFile);
      formData.append('resetFunding', resetFunding ? 'true' : 'false');
      const status: FundingSubmissionStatusDto = await request(OpenAPI, {
        method: 'POST',
        url: '/api/funding-submission/submit-csv',
        formData: formData
      });

      await useStore.getState().loadCurrentExchange();

      set({
        isWorking: false,
        mode: 'showPending',
        fundingStatus: status,
        isProcessing: true
      });
    } catch (err) {
      console.log(err);
      set({
        errorMessage: getErrorMessage(err),
        isProcessing: false,
        isWorking: false
      });
    }
  },

  cancelPending: async () => {
    try {
      set({
        errorMessage: null,
        isWorking: true
      });
      const status = await FundingSubmissionService.cancelPending();
      await useStore.getState().loadCurrentExchange();
      set({
        fundingStatus: status,
        errorMessage: null,
        isProcessing: false,
        isWorking: false
      });
    } catch (e) {
      set({
        errorMessage: getErrorMessage(e),
        isWorking: false
      });
    }
  },

  updateFundingStatus: async () => {
    try {
      set({
        isWorking: true,
        errorMessage: null
      });
      const fundingStatus = await FundingSubmissionService.getFundingStatus();
      const isProcessing = fundingStatus.numberOfPendingAddresses > 0;
      await useStore.getState().loadCurrentExchange();
      set({
        isProcessing: isProcessing,
        isWorking: false,
        fundingStatus: fundingStatus,
        mode: isProcessing ? 'showPending' : 'showCurrent'
      });
    } catch (e) {
      set({
        isWorking: false,
        errorMessage: getErrorMessage(e)
      });
    }
  },

  downloadExampleFile: async () => {
    try {
      await downloadFileFromApi('/api/funding-submission/download-example-file');
    } catch (err) {
      set({errorMessage: getErrorMessage(err)});
    }
  },

  deleteAddress: async (address: string) => {
    try {
      set({isProcessing: true});
      await FundingAddressService.deleteAddress(address);
      await useStore.getState().loadCurrentExchange();
    } catch (err) {
      set({errorMessage: getErrorMessage(err)});
    }
    set({isProcessing: false});
  },

  refreshExchangeBalances: async (exchangeId: string) => {
    set({isProcessing: true});
    try {
      await FundingSubmissionService.refreshBalances({
        exchangeId: exchangeId ?? ''
      });
    } catch (err) {
      const message = getErrorMessage(err);
      set({errorMessage: message});
      throw new Error(message);
    }
    set({isProcessing: false});
  }
});

export const useFundingStore = create<UseFundingStore>()(
  persist(creator, {
    name: 'funding-store'
  })
);
