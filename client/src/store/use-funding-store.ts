import create, { StateCreator } from 'zustand';
import { FundingStore } from './funding-store';
import { FundingSubmissionDto, FundingSubmissionService, FundingSubmissionStatus } from '../open-api';
import { persist } from 'zustand/middleware';
import { request } from '../open-api/core/request';
import { OpenAPI } from '../open-api/core';

const creator: StateCreator<FundingStore> = (set, get) => ({
  isWorking: false,
  updateMode: false,
  errorMessage: null,
  pinnedSubmission: null,
  signingMessage: null,
  currentSubmission: null,

  createFundingSubmission: async (
    addressFile: File
  ): Promise<FundingSubmissionDto | null> => {
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
      set({
        isWorking: false,
        pinnedSubmission: result
      });
      return result;
    } catch (err) {
      set({
        errorMessage: err.message,
        isWorking: false
      });
      return null;
    }
  },

  updateSubmission: (submission: FundingSubmissionDto) => {
    console.log('update submission', submission);
    if (submission._id === get().pinnedSubmission?._id) {
      if (submission.status === FundingSubmissionStatus.ACCEPTED) {
        set({
          pinnedSubmission: null,
          updateMode: false
        });
      } else {
        set({pinnedSubmission: submission});
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
    set({updateMode: false, pinnedSubmission: null});
  },

  cancelUpdate: async () => {
    try {
      const id = get().pinnedSubmission?._id;
      if (id) {
        set({errorMessage: null, isWorking: true});
        const res = await FundingSubmissionService.cancelSubmission({id});
        set({errorMessage: null, isWorking: false, pinnedSubmission: res});
      }
    } catch (e) {
      set({errorMessage: e.messasge, isWorking: false});
    }
  },

  loadCurrentSubmission: async () => {
    try {
      set({isWorking: true, errorMessage: ''});
      const signingMessage = await FundingSubmissionService.getSigningMessage();
      set({signingMessage: signingMessage});
      const currentSubmission = await FundingSubmissionService.getCurrentSubmission();
      if (currentSubmission._id === get().pinnedSubmission?._id && currentSubmission.status === FundingSubmissionStatus.ACCEPTED) {
        set({
          pinnedSubmission: null,
          updateMode: false
        });
      }

      set({
        isWorking: false,
        currentSubmission: currentSubmission
      });
    } catch (e) {
      set({isWorking: false, errorMessage: e.message});
    }
  }
});

export const useFundingStore = create<FundingStore>()(
  persist(creator, {
    name: 'funding-store'
  })
);
