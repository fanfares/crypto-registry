import create from 'zustand';
import io, { Socket } from 'socket.io-client';
import { ExchangeDto, FundingSubmissionDto } from '../open-api';
import { useStore } from './use-store';
import { useFundingStore } from './use-funding-store';

export interface UseWebSocket {
  socket: Socket | null;
  initWebSocket: () => Socket;
  closeSocket: () => void;
  isConnected: boolean
}

export const useWebSocket = create<UseWebSocket>()((set, get) => ({
  socket: null,
  isConnected: false,

  closeSocket: () => {
    get().socket?.close();
  },

  initWebSocket(): Socket {
    let socket = get().socket;
    if (!socket) {
      socket = io({ path: '/api/event'});
      socket.connect()

      socket.on('connect', () => {
        set({ isConnected: true });
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
      });

      socket.on('reconnect', () => {
        set({ isConnected: true });
      });

      socket.on('exchange', (exchange: ExchangeDto) => {
        useStore.getState().setExchange(exchange);
      })

      socket.on('funding-submissions', (submission: FundingSubmissionDto) => {
        useFundingStore.getState().updateSubmission(submission);
      })

      socket.on('nodes', (submission: FundingSubmissionDto) => {
        useFundingStore.getState().updateSubmission(submission);
      })

      set({ socket });
      return socket;
    } else {
      return socket;
    }
  }
}));
