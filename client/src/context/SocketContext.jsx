import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback((token) => {
    const s = io('/', {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    setSocket(s);
    return () => s.disconnect();
  }, []);

  const joinEvent = useCallback((eventId) => {
    socket?.emit('join:event', eventId);
  }, [socket]);

  const leaveEvent = useCallback((eventId) => {
    socket?.emit('leave:event', eventId);
  }, [socket]);

  const sendAnnouncement = useCallback((eventId, message, type) => {
    socket?.emit('announcement', { eventId, message, type });
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, connect, joinEvent, leaveEvent, sendAnnouncement }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
