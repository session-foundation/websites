export type Ed25519PublicKey = string & { __brand: 'Ed25519PublicKey' };

/** Arbitrary length hex string */
const hexRegex = /^[0-9a-fA-F]*$/;

/**
 * Checks if the given string is a valid hex string.
 * @param value The value to check.
 * @returns True if the value is a valid hex string, false otherwise.
 */
export function isHex(value: unknown): boolean {
  if (!value || typeof value !== 'string') return false;
  return hexRegex.test(value);
}

/**
 * Checks if the given string is a valid Ed25519 public key.
 * @param key The key to check.
 * @returns True if the key is a valid Ed25519 public key, false otherwise.
 *
 * NOTE: An ed25519 public key is a 64 character hex string.
 */
export const isEd25519PublicKey = (key: string): key is Ed25519PublicKey =>
  isHex(key) && key.length === 64;
