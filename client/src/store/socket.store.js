import { create } from 'zustand';

export const useSocketStore = create((set) => ({
  isConnected: false,
  socketId: null,

  setConnected: (connected, socketId = null) => set({
    isConnected: connected,
    socketId: connected ? socketId : null,
  }),
}));
