import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { hasE2EEBundle, unlockE2EEWithPassword, setupE2EEWithPassword } from '../utils/crypto';
import api from '../utils/api';

const E2EEContext = createContext(null);

export function E2EEProvider({ children }) {
  const { user } = useAuth();
  const [e2eeStatus, setE2eeStatus] = useState('checking'); // 'checking' | 'setup_needed' | 'locked' | 'unlocked'
  const [e2eePrivateKey, setE2eePrivateKey] = useState(() => sessionStorage.getItem('e2ee_session_pk') || null);
  const [e2eePublicKey, setE2eePublicKey] = useState(null);
  const [isSkipped, setIsSkipped] = useState(false);

  const initE2EE = useCallback(async () => {
    if (!user?.id) {
      setE2eeStatus('checking');
      return;
    }

    // 1. Check session storage (already unlocked in this session)
    const sessionPk = sessionStorage.getItem('e2ee_session_pk');
    if (sessionPk) {
      setE2eePrivateKey(sessionPk);
      setE2eeStatus('unlocked');
      return;
    }

    // 2. Check local storage
    if (hasE2EEBundle(user.id)) {
      setE2eeStatus('locked');
      return;
    }

    // 3. Check server
    try {
      const serverBundle = await api.getE2EEBundle();
      if (serverBundle && serverBundle.encryptedPrivateKey) {
        localStorage.setItem(`e2ee_bundle_${user.id}`, JSON.stringify({
          encryptedPrivateKey: serverBundle.encryptedPrivateKey,
          salt: serverBundle.salt,
          iv: serverBundle.iv,
          publicKey: serverBundle.publicKey,
        }));
        setE2eeStatus('locked');
      } else {
        setE2eeStatus('setup_needed');
      }
    } catch (err) {
      console.warn('[E2EE] Initial check failed:', err);
      // Fallback to setup if everything fails
      setE2eeStatus('setup_needed');
    }
  }, [user?.id]);

  useEffect(() => {
    // Reset skip state on user change
    setIsSkipped(false);
    initE2EE();
  }, [initE2EE]);

  const unlock = async (pin) => {
    if (!user?.id) return false;
    try {
      const result = await unlockE2EEWithPassword(user.id, pin);
      if (result && result.privateKey) {
        sessionStorage.setItem('e2ee_session_pk', result.privateKey);
        setE2eePrivateKey(result.privateKey);
        setE2eePublicKey(result.publicKey);
        setE2eeStatus('unlocked');
        return true;
      }
      return false;
    } catch (err) {
      console.error('[E2EE] Unlock failed:', err);
      throw err;
    }
  };

  const setup = async (pin) => {
    if (!user?.id) return false;
    try {
      const { publicKey, privateKey } = await setupE2EEWithPassword(user.id, pin);
      sessionStorage.setItem('e2ee_session_pk', privateKey);
      setE2eePrivateKey(privateKey);
      setE2eePublicKey(publicKey);
      setE2eeStatus('unlocked');
      return true;
    } catch (err) {
      console.error('[E2EE] Setup failed:', err);
      throw err;
    }
  };

  const value = {
    e2eeStatus,
    e2eePrivateKey,
    e2eePublicKey,
    isSkipped,
    unlock,
    setup,
    skip: () => setIsSkipped(true),
    refreshStatus: initE2EE
  };

  return (
    <E2EEContext.Provider value={value}>
      {children}
    </E2EEContext.Provider>
  );
}

export function useE2EE() {
  const ctx = useContext(E2EEContext);
  if (!ctx) throw new Error('useE2EE must be used within E2EEProvider');
  return ctx;
}
