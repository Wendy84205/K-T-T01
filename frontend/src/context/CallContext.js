import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import socketService from '../utils/socket';

const CallContext = createContext(null);

export function CallProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [incomingCall, setIncomingCall] = useState(null); // { offer, conversationId, callerId, type }

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !token) return;

    let cancelled = false;

    (async () => {
      const socket = await socketService.connect(token, user.id);
      if (cancelled || !socket) return;

      // Register as 'context' subscriber — does NOT overwrite the 'homepage' subscriber
      socketService.onCallMade((payload) => {
        setIncomingCall((current) => {
          // if already ringing/handling a call, ignore new invite for now
          if (current) return current;
          return payload;
        });

        // Lightweight push notification for users not on messenger screen
        try {
          if (document.visibilityState !== 'visible' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              // eslint-disable-next-line no-new
              new Notification('Incoming call', { body: 'You have an incoming call.' });
            } else if (Notification.permission === 'default') {
              Notification.requestPermission().catch(() => {});
            }
          }
        } catch (_) {}
      }, 'context');

      // Listen for call-ended so we can clear the banner when the caller cancels
      socketService.onCallEnded(() => {
        setIncomingCall(null);
      }, 'context');
    })();

    return () => {
      cancelled = true;
      socketService.offCallMade('context');
      socketService.offCallEnded('context');
      // Do NOT disconnect socket here; keep it global for the session.
    };
  }, [isAuthenticated, token, user?.id]);

  const declineIncomingCall = useCallback(() => {
    if (!incomingCall?.conversationId) {
      setIncomingCall(null);
      return;
    }
    socketService.sendCallResponse(incomingCall.conversationId, null, false);
    setIncomingCall(null);
  }, [incomingCall]);

  const openMessengerForCall = useCallback(() => {
    // Ensure the user is on the messenger screen to accept.
    navigate('/user/home');
  }, [navigate]);

  const value = useMemo(
    () => ({
      incomingCall,
      setIncomingCall,
      declineIncomingCall,
      openMessengerForCall,
    }),
    [incomingCall, declineIncomingCall, openMessengerForCall],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
}
