import { create, StateCreator } from 'zustand';
import { Store } from './store';
import { persist } from 'zustand/middleware';
import {
  BitcoinService,
  CredentialsDto,
  ExchangeDto,
  ExchangeService,
  ExtendedKeyValidationResult,
  Network,
  SystemService
} from '../open-api';
import { getErrorMessage } from '../utils';

const creator: StateCreator<Store> = (set, get) => ({
  errorMessage: null,
  currentExchange: null,
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
      const exchange = await ExchangeService.getUserExchange();
      set({
        currentExchange: exchange,
        isAuthenticated: !!token,
        docsUrl: data.docsUrl,
        isWorking: false,
        nodeName: data.nodeName,
        nodeAddress: data.nodeAddress,
        institutionName: data.institutionName
      });

    } catch (err) {
      set({errorMessage: getErrorMessage(err), isWorking: false});
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

  validateExtendedKey: async (key: string): Promise<ExtendedKeyValidationResult> => {
    set({isWorking: false, errorMessage: null});
    try {
      console.log('key', key);
      return await BitcoinService.validateExtendedKey(key);
    } catch (err) {
      set({errorMessage: getErrorMessage(err), isWorking: false});
      return {
        valid: false
      };
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
      isWorking: false,
      errorMessage: null,
      currentExchange: null
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
  },

  setExchange: (exchange: ExchangeDto) => {
    set({currentExchange: exchange});
  },

  loadCurrentExchange: async () => {
    try {
      set({isWorking: true, errorMessage: null});
      const exchange = await ExchangeService.getUserExchange();
      set({
        currentExchange: exchange,
        isWorking: false,
        errorMessage: null
      });
    } catch (err) {
      set({
        isWorking: false,
        errorMessage: getErrorMessage(err),
        currentExchange: null
      });
    }
  }
});

export const useStore = create<Store>()(
  persist(creator, {
    name: 'auth-store'
  })
);
