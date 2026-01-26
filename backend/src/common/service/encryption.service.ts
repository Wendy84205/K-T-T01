import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 16;
  private readonly tagLength = 16;

  /**
   * Generate a random encryption key (32 bytes for AES-256)
   */
  generateRandomKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Generate a random IV (Initialization Vector)
   */
  generateIV(): Buffer {
    return crypto.randomBytes(this.ivLength);
  }

  /**
   * Hash data using SHA-256
   */
  hashSHA256(data: Buffer | string): string {
    const hash = crypto.createHash('sha256');
    if (typeof data === 'string') {
      hash.update(data, 'utf8');
    } else {
      hash.update(data);
    }
    return hash.digest('hex');
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param data - Data to encrypt (Buffer or string)
   * @param key - Encryption key (32 bytes Buffer)
   * @returns Object containing encrypted data, IV, and auth tag
   */
  encrypt(data: Buffer | string, key: Buffer): {
    encrypted: Buffer;
    iv: Buffer;
    tag: Buffer;
  } {
    const iv = this.generateIV();
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    const input = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    const encrypted = Buffer.concat([
      cipher.update(input),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv,
      tag,
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param encrypted - Encrypted data buffer
   * @param key - Decryption key (32 bytes Buffer)
   * @param iv - Initialization Vector
   * @param tag - Authentication tag
   * @returns Decrypted data as Buffer
   */
  decrypt(
    encrypted: Buffer,
    key: Buffer,
    iv: Buffer,
    tag: Buffer,
  ): Buffer {
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted;
  }

  /**
   * Encrypt file buffer
   * @param fileBuffer - File content as Buffer
   * @param key - Encryption key
   * @returns Encrypted data with IV and tag
   */
  encryptFile(fileBuffer: Buffer, key: Buffer): {
    encrypted: Buffer;
    iv: string; // Base64 encoded
    tag: string; // Base64 encoded
  } {
    const { encrypted, iv, tag } = this.encrypt(fileBuffer, key);
    return {
      encrypted,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  }

  /**
   * Decrypt file buffer
   * @param encryptedBuffer - Encrypted file content
   * @param key - Decryption key
   * @param iv - IV as base64 string
   * @param tag - Auth tag as base64 string
   * @returns Decrypted file buffer
   */
  decryptFile(
    encryptedBuffer: Buffer,
    key: Buffer,
    iv: string,
    tag: string,
  ): Buffer {
    const ivBuffer = Buffer.from(iv, 'base64');
    const tagBuffer = Buffer.from(tag, 'base64');
    return this.decrypt(encryptedBuffer, key, ivBuffer, tagBuffer);
  }

  /**
   * Encrypt text message (for chat)
   * @param text - Plain text message
   * @param key - Encryption key
   * @returns Encrypted text as base64 string with IV and tag
   */
  encryptText(text: string, key: Buffer): {
    encrypted: string; // Base64
    iv: string; // Base64
    tag: string; // Base64
  } {
    const { encrypted, iv, tag } = this.encrypt(text, key);
    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  }

  /**
   * Decrypt text message (for chat)
   * @param encryptedText - Base64 encrypted text
   * @param key - Decryption key
   * @param iv - IV as base64 string
   * @param tag - Auth tag as base64 string
   * @returns Decrypted plain text
   */
  decryptText(
    encryptedText: string,
    key: Buffer,
    iv: string,
    tag: string,
  ): string {
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    const decrypted = this.decryptFile(encryptedBuffer, key, iv, tag);
    return decrypted.toString('utf8');
  }

  /**
   * Derive key from password using PBKDF2
   * @param password - User password
   * @param salt - Salt (optional, will generate if not provided)
   * @returns Object with derived key and salt
   */
  deriveKeyFromPassword(
    password: string,
    salt?: Buffer,
  ): { key: Buffer; salt: Buffer } {
    const usedSalt = salt || crypto.randomBytes(this.saltLength);
    const key = crypto.pbkdf2Sync(
      password,
      usedSalt,
      100000, // iterations
      this.keyLength,
      'sha256',
    );
    return { key, salt: usedSalt };
  }

  /**
   * Hash password using bcrypt (for user passwords)
   * @param password - Plain text password
   * @param rounds - Bcrypt rounds (default: 10)
   * @returns Hashed password
   */
  async hashPassword(password: string, rounds: number = 10): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * Verify password against bcrypt hash
   * @param password - Plain text password
   * @param hash - Bcrypt hash
   * @returns True if password matches
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a secure random token
   * @param length - Token length in bytes (default: 32)
   * @returns Hex encoded token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random string (for share tokens, etc.)
   * @param length - String length in bytes
   * @returns Base64 encoded string
   */
  generateSecureString(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64').replace(/[+/=]/g, '');
  }
}