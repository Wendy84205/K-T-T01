import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import { decryptPrivateKeyWithPassword, decryptPrivateKeyWithPin, encryptPrivateKeyWithPin, decryptHybridMessage } from '../utils/crypto';
import { getE2EEBundle } from '../api/chat';

const E2EEContext = createContext(null);

export const E2EEProvider = ({ children }) => {
  const { user } = useAuth();
  const [privateKey, setPrivateKey] = useState(null); // In-memory only
  const [isLocked, setIsLocked] = useState(true);
  const [hasKey, setHasKey] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (!user) {
        setPrivateKey(null);
        setIsLocked(true);
        setHasKey(false);
        return;
      }
      
      const stored = await SecureStore.getItemAsync(`e2ee_pin_bundle_${user.id}`);
      setHasKey(!!stored);
    };
    checkKey();
  }, [user]);

  const unlock = async (pin) => {
    if (!user) return false;
    
    try {
      const stored = await SecureStore.getItemAsync(`e2ee_pin_bundle_${user.id}`);
      if (!stored) throw new Error('Không tìm thấy khóa bảo mật trên thiết bị.');

      const bundle = JSON.parse(stored);
      const decryptedKey = await decryptPrivateKeyWithPin(bundle, pin);
      
      setPrivateKey(decryptedKey);
      setIsLocked(false);
      return true;
    } catch (err) {
      console.error('[E2EE] Unlock failed:', err);
      return false;
    }
  };

  const setupWithMasterPassword = async (masterPassword, pin) => {
    if (!user) return false;
    try {
      // 1. Fetch bundle from server
      const serverBundle = await getE2EEBundle();
      if (!serverBundle || !serverBundle.encryptedPrivateKey) {
          throw new Error('No security bundle found on server. Please setup E2EE on Web first.');
      }

      // 2. Decrypt with Master Password
      const plainPrivateKey = await decryptPrivateKeyWithPassword(serverBundle, masterPassword);

      // 3. Re-encrypt with PIN
      const pinBundle = await encryptPrivateKeyWithPin(plainPrivateKey, pin);

      // 4. Save to SecureStore
      await SecureStore.setItemAsync(`e2ee_pin_bundle_${user.id}`, JSON.stringify(pinBundle));
      
      setPrivateKey(plainPrivateKey);
      setIsLocked(false);
      setHasKey(true);
      return true;
    } catch (err) {
      console.error('[E2EE] Setup failed:', err);
      throw err; // Re-throw to show error in UI
    }
  };

  const decrypt = async (message) => {
    if (isLocked || !privateKey || !message.content) return message.content;
    
    // Nếu tin nhắn có dạng JSON (Hybrid), tiến hành giải mã
    if (message.content.startsWith('{') && message.content.includes('"v":"2"')) {
      try {
        const hybridData = JSON.parse(message.content);
        return await decryptHybridMessage(hybridData, privateKey, user.id);
      } catch (e) {
        return message.content;
      }
    }
    
    return message.content;
  };

  const wipeLocalKeys = async () => {
    if (user) {
      // Quét sạch rác của DB cũ để không bị mắc kẹt nữa
      await SecureStore.deleteItemAsync(`e2ee_pin_bundle_${user.id}`);
      setPrivateKey(null);
      setIsLocked(true);
      setHasKey(false);
      setIsSkipped(false);
    }
  };

  return (
    <E2EEContext.Provider value={{ isLocked, hasKey, isSkipped, privateKey, unlock, setupWithMasterPassword, decrypt, skip: () => setIsSkipped(true), wipeLocalKeys }}>
      {children}
    </E2EEContext.Provider>
  );
};

export const useE2EE = () => useContext(E2EEContext);
