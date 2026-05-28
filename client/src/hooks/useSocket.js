import { useEffect } from 'react';
import { socket, connectSocket, disconnectSocket } from '../config/socket.config';
import { useSocketStore } from '../store/socket.store';

export const useSocket = (token) => {
  const { isConnected, setConnected } = useSocketStore();

  useEffect(() => {
    if (!token) return;

    connectSocket(token);

    const onConnect = () => setConnected(true, socket.id);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // If socket is already connected when hook runs
    if (socket.connected) {
      setConnected(true, socket.id);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [token, setConnected]);

  const emit = (event, data) => {
    if (socket.connected) {
      socket.emit(event, data);
    }
  };

  const subscribe = (event, callback) => {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  };

  return { isConnected, emit, subscribe };
};
