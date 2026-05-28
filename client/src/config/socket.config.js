import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Initialize socket client lazily or directly. We will configure it to connect automatically,
// but auth headers will be set dynamically via store updates.
export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'],
});

export const connectSocket = (token) => {
  if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
