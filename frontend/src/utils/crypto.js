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
