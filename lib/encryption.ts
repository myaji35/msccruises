// Security Enhancement: Token Encryption
// Encrypt sensitive data like SNS tokens, API keys, etc.

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  
  if (!secret) {
    throw new Error(
      "ENCRYPTION_SECRET environment variable is not set. " +
      "Generate one using: openssl rand -base64 32"
    );
  }

  // Derive a key from the secret
  return crypto.scryptSync(secret, "salt", 32);
}

/**
 * Encrypt sensitive data (e.g., SNS tokens, API keys)
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: salt.iv.tag.encrypted
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    // Format: salt.iv.tag.encrypted (all base64)
    return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
  } catch (error: any) {
    console.error("[Encryption Error]", error.message);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted string from encrypt()
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const data = Buffer.from(encryptedData, "base64");

    // Extract components
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = data.subarray(ENCRYPTED_POSITION);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (error: any) {
    console.error("[Decryption Error]", error.message);
    throw new Error("Failed to decrypt data. Data may be corrupted.");
  }
}

/**
 * Hash sensitive data (one-way, for comparison only)
 * Use this for passwords, API key validation, etc.
 * @param text - Plain text to hash
 * @returns Hashed string
 */
export function hash(text: string): string {
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");
}

/**
 * Compare plain text with hashed value
 * @param plainText - Plain text
 * @param hashedText - Hashed text to compare
 * @returns True if match
 */
export function compareHash(plainText: string, hashedText: string): boolean {
  return hash(plainText) === hashedText;
}

/**
 * Generate a secure random token
 * @param length - Token length in bytes (default: 32)
 * @returns Random token (hex string)
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Mask sensitive data for logging
 * @param data - Sensitive string (e.g., token, API key)
 * @param visibleChars - Number of visible characters (default: 4)
 * @returns Masked string (e.g., "abcd****")
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return "*".repeat(data.length);
  }
  
  return data.substring(0, visibleChars) + "*".repeat(data.length - visibleChars);
}

// Export utilities
export const encryption = {
  encrypt,
  decrypt,
  hash,
  compareHash,
  generateSecureToken,
  maskSensitiveData,
};
