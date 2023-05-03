import create from 'zustand';
import io, { Socket } from 'socket.io-client';

export interface UseWebSocket {
  socket: Socket | null;
  getSocket: () => Socket
  isConnected: boolean
}

export const useWebSocket = create<UseWebSocket>()((set, get) => ({
  socket: null,
  isConnected: false,

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

      set({ socket });
      return socket;
    } else {
      return socket;
    }
  }
}));
