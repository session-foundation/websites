export type Ed25519PublicKey = string & { __brand: 'Ed25519PublicKey' };
export type BLSPublicKey = string & { __brand: 'BLSPublicKey' };
export type EthereumAddress = `0x${string}` & { __brand: 'EthereumAddress' };

/** Arbitrary length hex string */
const hexRegex = /^[0-9a-fA-F]*$/;

const isAddressCache = new Map<string, boolean>();
const isEd25519KeyCache = new Map<string, boolean>();
const isBLSKeyCache = new Map<string, boolean>();

function isEthereumAddressNoCache(address: string) {
  if (address.length === 42) {
    const prefix = address.slice(0, 2);
    return (prefix === '0x' || prefix === '0X') && hexRegex.test(address.slice(2));
  }
  if (address.length === 40) return hexRegex.test(address);
  return false;
}

/**
 * Checks if the given string is a valid Ethereum Address key.
 * @param address The address to check.
 * @returns True if the key is a valid Ethereum Address, false otherwise.
 *
 * NOTE: A Ethereum Address is a 40 character hex string with an optional `0x` prefix.
 */
export function isEthereumAddress(address: string): address is EthereumAddress {
  if (isAddressCache.has(address)) {
    // biome-ignore lint/style/noNonNullAssertion: if it has the item it will get the item
    return isAddressCache.get(address)!;
  }

  const result = isEthereumAddressNoCache(address);
  isAddressCache.set(address, result);
  return result;
}

/**
 * Checks if the given string is a valid Ed25519 public key.
 * @param key The key to check.
 * @returns True if the key is a valid Ed25519 public key, false otherwise.
 *
 * NOTE: A Ed25519 public key is a 64 character hex string.
 */
export function isEd25519PublicKey(key: string): key is Ed25519PublicKey {
  if (isEd25519KeyCache.has(key)) {
    // biome-ignore lint/style/noNonNullAssertion: if it has the item it will get the item
    return isEd25519KeyCache.get(key)!;
  }

  const result = key.length === 64 && hexRegex.test(key);
  isEd25519KeyCache.set(key, result);
  return result;
}

/**
 * Checks if the given string is a valid BLS public key.
 * @param key The key to check.
 * @returns True if the key is a valid BLS public key, false otherwise.
 *
 * NOTE: A BLS public key is a 128 character hex string.
 */
export function isBLSPublicKey(key: string): key is BLSPublicKey {
  if (isBLSKeyCache.has(key)) {
    // biome-ignore lint/style/noNonNullAssertion: if it has the item it will get the item
    return isBLSKeyCache.get(key)!;
  }

  const result = key.length === 128 && hexRegex.test(key);
  isBLSKeyCache.set(key, result);
  return result;
}
