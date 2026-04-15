import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SocketContext = createContext(null);

// SOCKET_URL_START
export const BACKEND_URL = 'https://necklace-insight-starring-machinery.trycloudflare.com';
// SOCKET_URL_END

export const SocketProvider = ({ children }) => {
  const { user } = useAuth(); // Track login state
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect Socket if user is logged in
    // Retrieve access token from SecureStore for Socket authentication
    if (!user) {
       if (socketRef.current) {
         socketRef.current.disconnect();
         socketRef.current = null;
         setSocket(null);
         setIsConnected(false);
       }
       return;
    }

    const connectSocket = async () => {
      // Retrieve token from SecureStore for Socket authentication
      const token = await SecureStore.getItemAsync('accessToken');
      
      const ioInstance = io(BACKEND_URL, {
        transports: ['polling'],
        auth: { token }, // Send token to Backend ChatGateway
        upgrade: false,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 20000,
      });

      socketRef.current = ioInstance;

      ioInstance.on('connect', () => {
        console.log('[Socket] Connected successfully:', ioInstance.id);
        setIsConnected(true);
        setSocket(ioInstance);
      });

      ioInstance.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
        setIsConnected(false);
      });

      ioInstance.on('disconnect', (reason) => {
        console.warn('[Socket] Disconnected due to:', reason);
        setIsConnected(false);
      });
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // Standard helper functions
  const joinConversation = (conversationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('joinConversation', { conversationId });
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leaveConversation', { conversationId });
    }
  };

  const sendTyping = (conversationId, isTyping) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { conversationId, isTyping });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinConversation, leaveConversation, sendTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
