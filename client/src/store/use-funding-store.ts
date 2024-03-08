import { create, StateCreator } from 'zustand';
import { FundingMode, FundingStore } from './funding-store';
import {
  BitcoinService,
  FundingSubmissionDto,
  FundingSubmissionService,
  FundingSubmissionStatus,
  Network
} from '../open-api';
import { persist } from 'zustand/middleware';
import { request } from '../open-api/core/request';
import { OpenAPI } from '../open-api/core';
import { getErrorMessage } from '../utils';
import { downloadFileFromApi } from '../open-api/core/download-file-from-api.ts';

const creator: StateCreator<FundingStore> = (set, get) => ({
  isProcessing: false,
  errorMessage: null,
  mode: 'showCurrent',
  pendingSubmission: null,
  signingMessage: null,
  currentSubmission: null,
  isWorking: true,

  clearFundingErrorMessage: () => {
    set({errorMessage: ''})
  },

  setMode: (mode: FundingMode) => {
    set({mode: mode});
  },

  createFundingSubmission: async (
    addressFile: File
  ): Promise<FundingSubmissionDto | null> => {
    set({
      errorMessage: null,
      isProcessing: true,
      isWorking: true
    });
    try {
      const formData = new FormData();
      formData.append('addressFile', addressFile);
      const result: FundingSubmissionDto = await request(OpenAPI, {
        method: 'POST',
        url: '/api/funding-submission/submit-csv',
        formData: formData
      });

      const isProcessing = result.status === FundingSubmissionStatus.PROCESSING || result.status === FundingSubmissionStatus.WAITING_FOR_PROCESSING;

      set({
        isWorking: false,
        mode: 'showPending',
        pendingSubmission: result,
        isProcessing: isProcessing
      });
      return result;
    } catch (err) {
      console.log('failed');
      set({
        errorMessage: getErrorMessage(err),
        isProcessing: false,
        isWorking: false
      });
      return null;
    }
  },

  updateSigningMessage: async () => {
    const {hash} = await BitcoinService.getLatestBlock(Network.TESTNET);
    set({
      signingMessage: hash
    });
  },

  cancelPending: async () => {
    try {
      const id = get().pendingSubmission?._id;
      if (id) {
        set({
          errorMessage: null,
          isWorking: true
        });
        const res = await FundingSubmissionService.cancelSubmission({id});
        set({
          errorMessage: null,
          isProcessing: false,
          isWorking: false,
          pendingSubmission: res
        });
      }
    } catch (e) {
      set({
        errorMessage: getErrorMessage(e),
        isWorking: false
      });
    }
  },

  loadCurrentSubmission: async () => {
    try {
      set({
        isWorking: true,
        errorMessage: null
      });
      const {hash} = await BitcoinService.getLatestBlock(Network.TESTNET);
      const funding = await FundingSubmissionService.getFundingStatus();
      const isProcessing = funding.pending && (funding.pending.status === FundingSubmissionStatus.PROCESSING || funding.pending.status === FundingSubmissionStatus.WAITING_FOR_PROCESSING);
      set({
        isProcessing: isProcessing,
        isWorking: false,
        currentSubmission: funding.current,
        pendingSubmission: funding.pending,
        mode: isProcessing ? 'showPending' : 'showCurrent',
        signingMessage: hash
      });
    } catch (e) {
      set({
        isWorking: false,
        errorMessage: getErrorMessage(e),
        currentSubmission: null
      });
    }
  },

  getFundingSubmissions: async (): Promise<FundingSubmissionDto[]> => {
    return FundingSubmissionService.getSubmissions();
  },

  pollPendingSubmission: async (): Promise<void> => {
    const pending = get().pendingSubmission;
    if (!pending) {
      throw new Error('No pending submission');
    }

    const updated = await FundingSubmissionService.getSubmission(pending._id);

    if (pending.status !== updated.status) {
      if (updated.status === FundingSubmissionStatus.ACCEPTED) {
        set({
          pendingSubmission: null,
          isProcessing: false,
          mode: 'showCurrent',
          currentSubmission: updated
        });
      } else {
        const isProcessing = updated.status === FundingSubmissionStatus.PROCESSING || updated.status === FundingSubmissionStatus.WAITING_FOR_PROCESSING;
        set({
          isProcessing: isProcessing,
          pendingSubmission: updated
        });
      }
    }
  },


  downloadExampleFile: async () => {
    try {
      await downloadFileFromApi('/api/funding-submission/download-example-file');
    } catch (err) {
      set({errorMessage: getErrorMessage(err)});
    }
  }
});

export const useFundingStore = create<FundingStore>()(
  persist(creator, {
    name: 'funding-store'
  })
);
