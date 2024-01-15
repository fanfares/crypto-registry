import { create, StateCreator } from 'zustand';
import { FundingStore } from './funding-store';
import { FundingSubmissionDto, FundingSubmissionService, FundingSubmissionStatus } from '../open-api';
import { persist } from 'zustand/middleware';
import { request } from '../open-api/core/request';
import { OpenAPI } from '../open-api/core';
import { getErrorMessage } from '../utils';

const creator: StateCreator<FundingStore> = (set, get) => ({
  isWorking: false,
  updateMode: false,
  errorMessage: null,
  pendingSubmission: null,
  signingMessage: null,
  currentSubmission: null,

  createFundingSubmission: async (
    addressFile: File
  ): Promise<FundingSubmissionDto | null> => {
    set({
      errorMessage: null,
      isWorking: true
    });
    try {
      const formData = new FormData();
      formData.append('addressFile', addressFile);
      formData.append('signingMessage', get().signingMessage ?? '');
      const result: FundingSubmissionDto = await request(OpenAPI, {
        method: 'POST',
        url: '/api/funding-submission/submit-csv',
        formData: formData
      });

      set({
        isWorking: false,
        pendingSubmission: result
      });
      return result;
    } catch (err) {
      set({
        errorMessage: getErrorMessage(err),
        isWorking: false
      });
      return null;
    }
  },

  updateSubmission: (submission: FundingSubmissionDto) => {
    if (submission._id === get().pendingSubmission?._id) {
      if (submission.status === FundingSubmissionStatus.ACCEPTED) {
        set({
          pendingSubmission: null,
          currentSubmission: submission,
          updateMode: false
        });
      } else {
        set({pendingSubmission: submission});
      }
    }
  },

  updateSigningMessage: async () => {
    const signingMessage = await FundingSubmissionService.getSigningMessage();
    set({
      signingMessage: signingMessage
    });
  },

  startUpdate: () => {
    set({updateMode: true});
  },

  clearUpdate: () => {
    set({updateMode: false, pendingSubmission: null});
  },

  cancelUpdate: async () => {
    try {
      const id = get().pendingSubmission?._id;
      if (id) {
        set({errorMessage: null, isWorking: true});
        const res = await FundingSubmissionService.cancelSubmission({id});
        set({errorMessage: null, isWorking: false, pendingSubmission: res});
      }
    } catch (e) {
      set({errorMessage: getErrorMessage(e), isWorking: false});
    }
  },

  loadCurrentSubmission: async () => {
    try {
      set({isWorking: true, errorMessage: null});
      const signingMessage = await FundingSubmissionService.getSigningMessage();
      const currentSubmission = await FundingSubmissionService.getCurrentSubmission();
      if (currentSubmission && currentSubmission._id === get().pendingSubmission?._id && currentSubmission.status === FundingSubmissionStatus.ACCEPTED) {
        set({
          isWorking: false,
          currentSubmission: currentSubmission,
          pendingSubmission: null,
          updateMode: false,
          signingMessage: signingMessage
        });
      } else {
        set({
          isWorking: false,
          currentSubmission: currentSubmission
        });
      }
      set({
        isWorking: false,
        currentSubmission: currentSubmission
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
  }

});

export const useFundingStore = create<FundingStore>()(
  persist(creator, {
    name: 'funding-store'
  })
);
