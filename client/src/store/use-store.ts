import create  from 'zustand'
import { Store } from './store';

export const useStore = create<Store>((set, get) => ({
  errorMessage: null,
  setErrorMessage: (errorMessage) => {
    set({ errorMessage: errorMessage})
  }
}))
