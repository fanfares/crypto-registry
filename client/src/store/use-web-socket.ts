import create from 'zustand';
import io, { Socket } from 'socket.io-client';

export interface UseWebSocket {
  socket: Socket | null;
  getSocket: () => Socket
}

export const useWebSocket = create<UseWebSocket>()((set, get) => ({
  socket: null,

  getSocket(): Socket {
    let socket = get().socket;
    if (!socket) {
      socket = io({ path: '/api/event'});
      socket.connect()
      set({ socket });
      return socket;
    } else {
      return socket;
    }
  }
}));
