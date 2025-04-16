import {
  type SimulateContractErrorType,
  type TransactionExecutionErrorType,
  formatUnits,
  parseUnits,
} from 'viem';
import type { WriteContractErrorType } from 'wagmi/actions';
import { SENT_DECIMALS } from './constants';

/**
 * Formats a value of type `bigint` as a string, using the {@link formatUnits} function and the {@link SENT_DECIMALS} constant.
 * @deprecated - Use {@link formatSENTBigInt} instead.
 * @param value - The value to be formatted.
 * @returns The formatted value as a string.
 */
export function formatSENT(value: bigint): string {
  return formatUnits(value, SENT_DECIMALS);
}

/**
 * Parses a string value into a `bigint` representing SENT. Uses the {@link parseUnits} function and the {@link SENT_DECIMALS} constant.
 * @param value - The string value to parse.
 * @returns A `bigint` representing SENT.
 */
export function parseSENT(value: string): bigint {
  return parseUnits(value, SENT_DECIMALS);
}

/**
 * Get a smart contract error name from a wagmi error.
 * @param error - The error to get the name from.
 * @returns The error name.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: good luck reducing the complexity
export function getContractErrorName(
  error: Error | SimulateContractErrorType | WriteContractErrorType | TransactionExecutionErrorType
) {
  let reason = error.name;

  // uncomment this to log the object, trust me it's useful
  // console.log({
  //   error,
  //   errorKeys: Object.keys(error),
  // });

  if (error?.cause && typeof error.cause === 'object') {
    if (
      'data' in error.cause &&
      error.cause.data &&
      typeof error.cause.data === 'object' &&
      'abiItem' in error.cause.data &&
      error.cause.data.abiItem &&
      typeof error.cause.data.abiItem === 'object' &&
      'name' in error.cause.data.abiItem &&
      typeof error.cause.data.abiItem.name === 'string' &&
      error.cause.data.abiItem.name !== 'Error'
    ) {
      reason = error.cause.data.abiItem.name;
    } else if (
      'cause' in error.cause &&
      typeof error.cause.cause === 'object' &&
      error.cause.cause &&
      'name' in error.cause.cause &&
      typeof error.cause.cause.name === 'string'
    ) {
      reason = error.cause.cause.name;
    } else if ('name' in error.cause && error.cause.name && typeof error.cause.name === 'string') {
      reason = error.cause.name;
      if (
        reason === 'ContractFunctionRevertedError' &&
        'reason' in error.cause &&
        error.cause.reason &&
        typeof error.cause.reason === 'string'
      ) {
        const reasonLower = error.cause.reason.toLowerCase();
        if (reasonLower.includes('reject') && reasonLower.includes('user')) {
          reason = 'UserRejectedRequest';
        } else if (reasonLower.includes('internal') && reasonLower.includes('rpc')) {
          reason = 'InternalRpc';
        } else if (reasonLower.includes('amount exceeds balance')) {
          reason = 'InsufficientBalance';
        }
      }
    }
  }

  return reason.endsWith('Error') ? reason.slice(0, -5) : reason;
}

export const HEX_BYTES = {
  BLS_KEY_BYTES: 128,
  BLS_SIG_BYTES: 256,
  ED_25519_KEY_BYTES: 64,
  ED_25519_SIG_BYTES: 128,
};

const bytes64 = 64;

/**
 * Encodes a hex string to an array of BigInt chunks.
 * @param hex - The hex string to encode.
 * @param hexBytes - The number of bytes in the hex string.
 * @returns An array of BigInt chunks.
 */
export function encodeHexToBigIntChunks(hex: string, hexBytes: number): Array<bigint> {
  if (hexBytes < bytes64 || hexBytes % bytes64 !== 0) {
    throw new Error(`hexBytes must be divisible by ${bytes64}. hexBits: ${hexBytes}`);
  }

  if (hex.length !== hexBytes) {
    throw new Error(`Hex length is invalid, it must be a ${hexBytes} byte string`);
  }

  const numberOfChunks = hexBytes / bytes64;

  const chunks: Array<string> = [];
  for (let i = 0; i < numberOfChunks; i++) {
    chunks.push(hex.slice(i * bytes64, (i + 1) * bytes64));
  }

  return chunks.map((hexChunk) => BigInt(`0x${hexChunk}`));
}

export const encodeBlsPubKey = (hex: string) => {
  const chunks = encodeHexToBigIntChunks(hex, HEX_BYTES.BLS_KEY_BYTES);
  const [X, Y] = chunks;
  if (chunks.length !== 2) {
    throw new Error(`BLS Pubkey improperly chunked. Expected 2 chunks, got ${chunks.length}`);
  }
  if (typeof X === 'undefined') {
    throw new Error(`BLS Pubkey improperly chunked. X is undefined, got ${X}`);
  }
  if (typeof Y === 'undefined') {
    throw new Error(`BLS Pubkey improperly chunked. Y is undefined, got ${Y}`);
  }
  return { X, Y };
};

export const encodeBlsSignature = (hex: string) => {
  const chunks = encodeHexToBigIntChunks(hex, HEX_BYTES.BLS_SIG_BYTES);
  const [sigs0, sigs1, sigs2, sigs3] = chunks;
  if (chunks.length !== 4) {
    throw new Error(`BLS Signature improperly chunked. Expected 4 chunks, got ${chunks.length}`);
  }
  if (typeof sigs0 === 'undefined') {
    throw new Error(`BLS Signature improperly chunked. sigs0 is undefined, got ${sigs0}`);
  }
  if (typeof sigs1 === 'undefined') {
    throw new Error(`BLS Signature improperly chunked. sigs0 is undefined, got ${sigs1}`);
  }
  if (typeof sigs2 === 'undefined') {
    throw new Error(`BLS Signature improperly chunked. sigs0 is undefined, got ${sigs2}`);
  }
  if (typeof sigs3 === 'undefined') {
    throw new Error(`BLS Signature improperly chunked. sigs0 is undefined, got ${sigs3}`);
  }

  return { sigs0, sigs1, sigs2, sigs3 };
};

export const encodeED25519PubKey = (hex: string) => {
  const chunks = encodeHexToBigIntChunks(hex, HEX_BYTES.ED_25519_KEY_BYTES);
  const [pubKey] = chunks;
  if (chunks.length !== 1) {
    throw new Error(
      `ED 25519 Public Key improperly chunked. Expected 1 chunk, got ${chunks.length}`
    );
  }
  if (typeof pubKey === 'undefined') {
    throw new Error(`ED 25519 Public Key improperly chunked. pubKey is undefined, got ${pubKey}`);
  }
  return { pubKey };
};

export const encodeED25519Signature = (hex: string) => {
  const chunks = encodeHexToBigIntChunks(hex, HEX_BYTES.ED_25519_SIG_BYTES);
  const [sigs0, sigs1] = chunks;
  if (chunks.length !== 2) {
    throw new Error(
      `ED 25519 Signature improperly chunked. Expected 2 chunks, got ${chunks.length}`
    );
  }
  if (typeof sigs0 === 'undefined') {
    throw new Error(`ED 25519 Signature improperly chunked. sigs0 is undefined, got ${sigs0}`);
  }
  if (typeof sigs1 === 'undefined') {
    throw new Error(`ED 25519 Signature improperly chunked. sigs0 is undefined, got ${sigs1}`);
  }
  return { sigs0, sigs1 };
};
