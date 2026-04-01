import type { BLSPublicKey, Ed25519PublicKey, EthereumAddress } from './keys';

/**
 * Collapses a string by replacing characters between the leading and trailing characters with a triple ellipsis Unicode character (length 1).
 * The final length of the string will be the sum of the leading and trailing characters plus 1.
 * @param str - The input string to collapse.
 * @param leadingChars - The number of characters to keep at the beginning of the string.
 * @param trailingChars - The number of characters to keep at the end of the string.
 * @returns The collapsed string.
 */
export const collapseString = (str: string, leadingChars = 6, trailingChars = 4): string => {
  if (str.length <= leadingChars + trailingChars + 3) return str;
  return `${str.slice(0, leadingChars)}…${str.slice(-trailingChars)}`;
};

/**
 * Check Ethereum address equality (40 hex chars, optionally 0x prefixed)
 * @param addr1 - First Ethereum address
 * @param addr2 - Second Ethereum address
 * @returns True if addresses are equal
 *
 * NOTE: This function assumes if the address is not falsy it is a valid ethereum address, 40 characters without 0x prefix or 42 with 0x prefix.
 */
export const areEthereumAddressesEqual = (
  addr1?: EthereumAddress | null,
  addr2?: EthereumAddress | null
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: the complexity is required
) => {
  if (!addr1 || !addr2) return false;
  if (addr1 === addr2) return true;

  const start1 = addr1.length === 42 ? 2 : 0;
  const start2 = addr2.length === 42 ? 2 : 0;

  if (addr1.length - start1 !== addr2.length - start2) return false;

  // Unrolled comparison for 40 chars (better performance)
  for (let i = 0; i < 40; i += 4) {
    let c1a = addr1.charCodeAt(start1 + i);
    let c1b = addr1.charCodeAt(start1 + i + 1);
    let c1c = addr1.charCodeAt(start1 + i + 2);
    let c1d = addr1.charCodeAt(start1 + i + 3);

    let c2a = addr2.charCodeAt(start2 + i);
    let c2b = addr2.charCodeAt(start2 + i + 1);
    let c2c = addr2.charCodeAt(start2 + i + 2);
    let c2d = addr2.charCodeAt(start2 + i + 3);

    // Convert A-F to a-f
    if (c1a >= 65 && c1a <= 70) c1a += 32;
    if (c1b >= 65 && c1b <= 70) c1b += 32;
    if (c1c >= 65 && c1c <= 70) c1c += 32;
    if (c1d >= 65 && c1d <= 70) c1d += 32;

    if (c2a >= 65 && c2a <= 70) c2a += 32;
    if (c2b >= 65 && c2b <= 70) c2b += 32;
    if (c2c >= 65 && c2c <= 70) c2c += 32;
    if (c2d >= 65 && c2d <= 70) c2d += 32;

    if (c1a !== c2a || c1b !== c2b || c1c !== c2c || c1d !== c2d) return false;
  }

  return true;
};

function genericHexPubkeyComparison(
  nonPrefixedLength: number,
  key1?: string | null,
  key2?: string | null
): boolean {
  if (!key1 || !key2) return false;
  if (key1 === key2) return true;

  const start1 = key1.length === nonPrefixedLength ? 0 : 2;
  const start2 = key2.length === nonPrefixedLength ? 0 : 2;

  if (key1.length - start1 !== key2.length - start2) return false;

  // Optimized loop for 96 chars
  for (let i = 0; i < nonPrefixedLength; i++) {
    let c1 = key1.charCodeAt(start1 + i);
    let c2 = key2.charCodeAt(start2 + i);

    // Convert A-F to a-f
    if (c1 >= 65 && c1 <= 70) c1 += 32;
    if (c2 >= 65 && c2 <= 70) c2 += 32;

    if (c1 !== c2) return false;
  }

  return true;
}

/**
 * Check Ed25519 public key equality (64 hex chars, optionally 0x prefixed)
 * @param key1 - First Ed25519 public key
 * @param key2 - Second Ed25519 public key
 * @returns True if keys are equal
 *
 * NOTE: This function assumes if the Ed25519 key is not falsy it is a valid Ed25519 key, 64 characters without 0x prefix or 66 with 0x prefix.
 */
export const areEd25519KeysEqual = (
  key1?: Ed25519PublicKey | null,
  key2?: Ed25519PublicKey | null
) => {
  return genericHexPubkeyComparison(64, key1, key2);
};

/**
 * Check BLS public key equality (96 hex chars, optionally 0x prefixed)
 * @param key1 - First BLS public key
 * @param key2 - Second BLS public key
 * @returns True if keys are equal
 *
 * NOTE: This function assumes if the BLS key is not falsy it is a valid BLS key, 128 characters without 0x prefix or 130 with 0x prefix.
 */
export const areBLSKeysEqual = (key1?: BLSPublicKey | null, key2?: BLSPublicKey | null) => {
  return genericHexPubkeyComparison(128, key1, key2);
};
