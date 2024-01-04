import create from 'zustand';
import io, { Socket } from 'socket.io-client';
import { ExchangeDto } from '../open-api';
import { useStore } from './use-store';

export interface UseWebSocket {
  socket: Socket | null;
  getSocket: () => Socket;
  closeSocket: () => void;
  isConnected: boolean
}

export const useWebSocket = create<UseWebSocket>()((set, get) => ({
  socket: null,
  isConnected: false,

  closeSocket: () => {
    get().socket?.close();
  },

  getSocket(): Socket {
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


      set({ socket });
      return socket;
    } else {
      return socket;
    }
  }
}));
