import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }, []);

  const subscribeTo = useCallback((type, id) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot subscribe: socket not connected');
      return false;
    }
    console.log(`Subscribing to ${type}:${id}`);
    socketRef.current.emit(`subscribe:${type}`, id);
    return true;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return {
    socket: socketRef.current,
    subscribeTo,
    isConnected: socketRef.current?.connected || false
  };
}