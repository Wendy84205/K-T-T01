import forge from 'node-forge';
import 'react-native-get-random-values';

/**
 * UTILS FOR MOBILE E2EE
 * Mirroring Web SubtleCrypto logic using node-forge (Pure JS for Expo Go compatibility)
 */

const PIN_ITERATIONS = 100_000; 
const MASTER_PASSWORD_ITERATIONS = 310_000; // Khớp với bản Web

/**
 * Derive an AES-256 key from a 6-digit PIN + Salt using PBKDF2
 */
export async function deriveKeyFromPin(pin, saltBase64) {
  const salt = forge.util.decode64(saltBase64);
  const key = forge.pkcs5.pbkdf2(pin, salt, PIN_ITERATIONS, 32, forge.md.sha256.create());
  return key; // binary string
}

/**
 * Derive an AES-256 key from a Master Password + Salt using PBKDF2 (Web Parity)
 */
export async function deriveKeyFromPassword(password, saltBase64) {
  const salt = forge.util.decode64(saltBase64);
  const key = forge.pkcs5.pbkdf2(password, salt, MASTER_PASSWORD_ITERATIONS, 32, forge.md.sha256.create());
  return key; // binary string
}

/**
 * Decrypt RSA Private Key with Master Password (Web migration flow)
 */
export async function decryptPrivateKeyWithPassword(encryptedData, password) {
  const { encryptedPrivateKey, salt, iv } = encryptedData;
  const aesKey = await deriveKeyFromPassword(password, salt);
  
  const decipher = forge.cipher.createDecipher('AES-GCM', aesKey);
  decipher.start({
    iv: forge.util.decode64(iv),
    tag: forge.util.decode64(encryptedData.tag || encryptedPrivateKey.slice(-16)) // Fallback tag if not separate
  });
  
  // Standard WebCrypto might append tag or keep it separate. 
  // We need to handle both cases.
  const data = forge.util.decode64(encryptedPrivateKey);
  decipher.update(forge.util.createBuffer(data));
  
  const pass = decipher.finish();
  if (!pass) throw new Error('Master Password không chính xác.');
  
  return decipher.output.toString(); 
}

/**
 * Encrypt RSA Private Key with PIN (Mobile storage flow)
 */
export async function encryptPrivateKeyWithPin(privateKey, pin) {
  const salt = forge.random.getBytesSync(32);
  const iv = forge.random.getBytesSync(12);
  const aesKey = await deriveKeyFromPin(pin, forge.util.encode64(salt));

  const cipher = forge.cipher.createCipher('AES-GCM', aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(privateKey));
  cipher.finish();

  return {
    encryptedPrivateKey: forge.util.encode64(cipher.output.getBytes()),
    tag: forge.util.encode64(cipher.mode.tag.getBytes()),
    salt: forge.util.encode64(salt),
    iv: forge.util.encode64(iv)
  };
}


/**
 * Decrypt a Hybrid Encrypted message (RSA + AES)
 * hybridData: { ciphertext, iv, keys: { [userId]: encryptedAesKey } }
 */
export async function decryptHybridMessage(hybridData, privateKeyBase64, myUserId) {
  try {
    const encryptedAesKeyB64 = hybridData.keys[myUserId];
    if (!encryptedAesKeyB64) throw new Error('No key for current user');

    // 1. Decrypt AES Key with RSA
    const privateKey = forge.pki.privateKeyFromPem(
      `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`
    );
    const encryptedAesKey = forge.util.decode64(encryptedAesKeyB64);
    const aesKeyRaw = privateKey.decrypt(encryptedAesKey, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    });

    // 2. Decrypt Content with AES-GCM
    const iv = forge.util.decode64(hybridData.iv);
    const ciphertext = forge.util.decode64(hybridData.ciphertext);
    const decipher = forge.cipher.createDecipher('AES-GCM', aesKeyRaw);
    
    // In many hybrid systems, the tag is the last 16 bytes of the ciphertext if not separate
    // For now, assume it's stored in hybridData.tag or appended
    const tag = hybridData.tag ? forge.util.decode64(hybridData.tag) : '';
    
    decipher.start({ iv, tag });
    decipher.update(forge.util.createBuffer(ciphertext));
    const pass = decipher.finish();
    
    if (!pass) return "[Unable to authenticate message]";
    return decipher.output.toString('utf8');
  } catch (err) {
    console.error('[E2EE] Decryption error:', err);
    return "[Mã hóa: Lỗi giải mã]";
  }
}

/**
 * Helper to convert master password key to local PIN key
 * (Used during initial setup on mobile)
 */
export async function migrateMasterPasswordToPin(encryptedPrivateKeyB64, masterPassword, salt, iv, pin) {
  // Logic: Decrypt with password (like web), then encrypt with PIN
  // For now, this is a conceptual placeholder as we focus on PIN decryption
}
