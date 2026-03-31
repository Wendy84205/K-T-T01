/**
 * Crypto Utilities for True End-to-End Encryption (E2EE)
 * Using Web Crypto API (SubtleCrypto)
 * Supports Hybrid Encryption (AES + RSA) for large content
 */

const RSA_ALGORITHM = {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
};

const AES_ALGORITHM = {
    name: "AES-GCM",
    length: 256
};

const PBKDF2_ITERATIONS = 310_000; // OWASP 2023 recommended minimum

/**
 * Derive a 256-bit AES-GCM key from a password + salt using PBKDF2.
 * The SAME password + SAME salt always produces the SAME key.
 */
export async function deriveAesKeyFromPassword(password, saltBase64) {
    const salt = base64ToArrayBuffer(saltBase64);
    const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt the RSA private key (base64) with a password-derived AES key.
 * Returns { encryptedPrivateKey, salt, iv } all as base64 strings.
 */
export async function encryptPrivateKeyWithPassword(privateKeyBase64, password) {
    const salt = window.crypto.getRandomValues(new Uint8Array(32));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const saltB64 = arrayBufferToBase64(salt);

    const aesKey = await deriveAesKeyFromPassword(password, saltB64);
    const privateKeyBytes = new TextEncoder().encode(privateKeyBase64);

    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        privateKeyBytes
    );

    return {
        encryptedPrivateKey: arrayBufferToBase64(encrypted),
        salt: saltB64,
        iv: arrayBufferToBase64(iv),
    };
}

/**
 * Decrypt the RSA private key using password + stored salt + iv.
 * Throws if password is wrong.
 */
export async function decryptPrivateKeyWithPassword(encryptedPrivateKeyBase64, password, saltBase64, ivBase64) {
    const aesKey = await deriveAesKeyFromPassword(password, saltBase64);
    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToArrayBuffer(ivBase64) },
        aesKey,
        base64ToArrayBuffer(encryptedPrivateKeyBase64)
    );
    return new TextDecoder().decode(decrypted);
}

/**
 * Full E2EE Setup (first time):
 * 1. Generate RSA-2048 key pair
 * 2. Encrypt private key with password → store in localStorage
 * 3. Return public key (caller should upload to backend)
 */
export async function setupE2EEWithPassword(userId, password) {
    const { publicKey, privateKey } = await generateKeyPair();
    const encrypted = await encryptPrivateKeyWithPassword(privateKey, password);

    const bundle = {
        encryptedPrivateKey: encrypted.encryptedPrivateKey,
        salt: encrypted.salt,
        iv: encrypted.iv,
        publicKey, // cached for convenience
    };

    // Store locally
    localStorage.setItem(`e2ee_bundle_${userId}`, JSON.stringify(bundle));

    // Backup to server (encrypted bundle is safe to store server-side — PIN never leaves device)
    try {
        const { default: api } = await import('./api');
        await api.saveE2EEBundle({
            encryptedPrivateKey: encrypted.encryptedPrivateKey,
            salt: encrypted.salt,
            iv: encrypted.iv,
        });
    } catch (err) {
        console.warn('[E2EE] Server backup failed, local only:', err);
    }

    return { publicKey, privateKey };
}

/**
 * Unlock E2EE on login:
 * 1. Load encrypted bundle from localStorage
 * 2. Decrypt private key with password
 * 3. Return privateKey (plain) for use in decryption
 *
 * Returns null if no bundle found (need setup) or throws if password wrong.
 */
export async function unlockE2EEWithPassword(userId, password) {
    let raw = localStorage.getItem(`e2ee_bundle_${userId}`);

    // If no local bundle, try fetching from server
    if (!raw) {
        try {
            const { default: api } = await import('./api');
            const serverBundle = await api.getE2EEBundle();
            if (serverBundle && serverBundle.encryptedPrivateKey) {
                // Save server bundle locally for future use
                localStorage.setItem(`e2ee_bundle_${userId}`, JSON.stringify({
                    encryptedPrivateKey: serverBundle.encryptedPrivateKey,
                    salt: serverBundle.salt,
                    iv: serverBundle.iv,
                    publicKey: serverBundle.publicKey,
                }));
                raw = localStorage.getItem(`e2ee_bundle_${userId}`);
            }
        } catch (err) {
            console.warn('[E2EE] Could not fetch bundle from server:', err);
        }
    }

    if (!raw) return null; // no bundle anywhere — need setupE2EEWithPassword

    const bundle = JSON.parse(raw);
    // Throws DOMException if password is wrong (AES-GCM auth tag fails)
    const privateKey = await decryptPrivateKeyWithPassword(
        bundle.encryptedPrivateKey,
        password,
        bundle.salt,
        bundle.iv
    );
    return { privateKey, publicKey: bundle.publicKey };
}

/**
 * Check if a user already has an E2EE bundle stored.
 */
export function hasE2EEBundle(userId) {
    return Boolean(localStorage.getItem(`e2ee_bundle_${userId}`));
}


/**
 * Generates a new RSA-OAEP key pair for E2EE
 */
export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        RSA_ALGORITHM,
        true,
        ["encrypt", "decrypt"]
    );

    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
        publicKey: arrayBufferToBase64(publicKeyBuffer),
        privateKey: arrayBufferToBase64(privateKeyBuffer),
    };
}

/**
 * Legacy Encrypt (RSA Only) - Restricted by length (~190 bytes)
 */
export async function encryptContent(content, publicKeyBase64) {
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);
    const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        RSA_ALGORITHM,
        false,
        ["encrypt"]
    );

    const encodedContent = new TextEncoder().encode(content);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        encodedContent
    );

    return arrayBufferToBase64(encryptedBuffer);
}

/**
 * Legacy Decrypt (RSA Only)
 */
export async function decryptContent(encryptedBase64, privateKeyBase64) {
    try {
        const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            privateKeyBuffer,
            RSA_ALGORITHM,
            false,
            ["decrypt"]
        );

        const encryptedBuffer = base64ToArrayBuffer(encryptedBase64);
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedBuffer
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
        console.error("Decryption failed:", error);
        return "[Unable to decrypt message]";
    }
}

/**
 * HYBRID ENCRYPTION (Recommended for messages)
 * Encrypts content with a random AES-GCM key, then encrypts that AES key with multiple public keys.
 */
export async function encryptHybrid(content, recipientPublicKeysMap) {
    // 1. Generate random AES key
    const aesKey = await window.crypto.subtle.generateKey(AES_ALGORITHM, true, ["encrypt", "decrypt"]);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // 2. Encrypt content with AES
    const encodedContent = new TextEncoder().encode(content);
    const encryptedContentBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        aesKey,
        encodedContent
    );

    // 3. Export AES key to encrypt it via RSA
    const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

    // 4. Encrypt AES key for each recipient
    const encryptedKeys = {};
    for (const [userId, pubKeyBase64] of Object.entries(recipientPublicKeysMap)) {
        if (!pubKeyBase64) continue;
        const pubKeyBuffer = base64ToArrayBuffer(pubKeyBase64);
        const publicKey = await window.crypto.subtle.importKey("spki", pubKeyBuffer, RSA_ALGORITHM, false, ["encrypt"]);
        const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, exportedAesKey);
        encryptedKeys[userId] = arrayBufferToBase64(encryptedAesKeyBuffer);
    }

    return {
        v: "2", // Version 2: Hybrid
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(encryptedContentBuffer),
        keys: encryptedKeys
    };
}

/**
 * HYBRID DECRYPTION
 */
export async function decryptHybrid(hybridData, privateKeyBase64, myId) {
    try {
        const encryptedAesKeyBase64 = hybridData.keys[myId];
        if (!encryptedAesKeyBase64) throw new Error("No payload for current user");

        // 1. Decrypt AES key with RSA
        const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
        const privateKey = await window.crypto.subtle.importKey("pkcs8", privateKeyBuffer, RSA_ALGORITHM, false, ["decrypt"]);
        const encryptedAesKeyBuffer = base64ToArrayBuffer(encryptedAesKeyBase64);
        const aesKeyBuffer = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedAesKeyBuffer);

        // 2. Import decrypted AES key
        const aesKey = await window.crypto.subtle.importKey("raw", aesKeyBuffer, AES_ALGORITHM, false, ["decrypt"]);

        // 3. Decrypt content with AES
        const iv = base64ToArrayBuffer(hybridData.iv);
        const ciphertext = base64ToArrayBuffer(hybridData.ciphertext);
        const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, aesKey, ciphertext);

        return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
        console.error("[E2EE] Hybrid decryption failed", e);
        return "[Unable to decrypt hybrid message]";
    }
}

// Helper functions
function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
