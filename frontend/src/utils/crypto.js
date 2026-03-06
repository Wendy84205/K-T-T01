/**
 * Crypto Utilities for True End-to-End Encryption (E2EE)
 * Using Web Crypto API (SubtleCrypto)
 */

const RSA_ALGORITHM = {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
};

/**
 * Generates a new RSA-OAEP key pair for E2EE
 * @returns {Promise<{publicKey: string, privateKey: string}>} - PEM formatted keys
 */
export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        RSA_ALGORITHM,
        true, // extractable
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
 * Encrypts content using a recipient's public key
 * @param {string} content - Plain text content
 * @param {string} publicKeyBase64 - Recipient's public key in Base64
 * @returns {Promise<string>} - Encrypted content in Base64
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
 * Decrypts content using your own private key
 * @param {string} encryptedBase64 - Encrypted content in Base64
 * @param {string} privateKeyBase64 - Your private key in Base64
 * @returns {Promise<string>} - Decrypted plain text
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
