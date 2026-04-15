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
  const { user } = useAuth(); // Theo dõi trạng thái đăng nhập
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Chỉ kết nối Socket nếu user đã đăng nhập & lấy mượn accessToken (từ in-memory Auth)
    // Tạm thời giả định token được API ngầm truyền đi (hoặc truyền qua AuthContext)
    
    // Vì useAuth trong app này hiện chưa expose accessToken thô, 
    // Nếu backend yêu cầu Auth token khi connect socket, bạn sẽ phải móc nối từ SecureStore.
    // Tạm thời ta connect ẩn danh hoặc lấy token nếu có.
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
      // Lấy token từ bộ nhớ bảo mật để xác thực Socket
      const token = await SecureStore.getItemAsync('accessToken');
      
      const ioInstance = io(BACKEND_URL, {
        transports: ['polling'],
        auth: { token }, // Gửi token cho Backend ChatGateway
        upgrade: false,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 20000,
      });

      socketRef.current = ioInstance;

      ioInstance.on('connect', () => {
        console.log('[Socket] Đã kết nối thành công:', ioInstance.id);
        setIsConnected(true);
        setSocket(ioInstance);
      });

      ioInstance.on('connect_error', (err) => {
        console.error('[Socket] Lỗi kết nối:', err.message);
        setIsConnected(false);
      });

      ioInstance.on('disconnect', (reason) => {
        console.warn('[Socket] Ngắt kết nối do:', reason);
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

  // Các hàm chức năng phụ trợ chuẩn
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
