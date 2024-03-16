import { create, StateCreator } from 'zustand';
import { FundingMode, FundingStore } from './funding-store';
import { FundingAddressService, FundingSubmissionService, FundingSubmissionStatusDto } from '../open-api';
import { persist } from 'zustand/middleware';
import { request } from '../open-api/core/request';
import { OpenAPI } from '../open-api/core';
import { getErrorMessage } from '../utils';
import { downloadFileFromApi } from '../open-api/core/download-file-from-api.ts';
import { useStore } from './use-store.ts';

const creator: StateCreator<FundingStore> = (set) => ({
  isProcessing: false,
  errorMessage: null,
  mode: 'showCurrent',
  fundingSubmissionStatus: null,

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
        fundingSubmissionStatus: status,
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
        fundingSubmissionStatus: status,
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

  updateSubmissionStatus: async () => {
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
        fundingSubmissionStatus: fundingStatus,
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
  }

});

export const useFundingStore = create<FundingStore>()(
  persist(creator, {
    name: 'funding-store'
  })
);
