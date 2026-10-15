import {
  areBLSKeysEqual as _areBLSKeysEqual,
  areEd25519KeysEqual as _areEd25519KeysEqual,
  areEthereumAddressesEqual as _areEthereumAddressesEqual,
  collapseString,
} from '../src/string';
import type { BLSPublicKey, Ed25519PublicKey, EthereumAddress } from '../src/keys';

const areBLSKeysEqual = (addr1: unknown, addr2: unknown) => {
  return _areBLSKeysEqual(addr1 as BLSPublicKey, addr2 as BLSPublicKey)
}

const areEd25519KeysEqual = (addr1: unknown, addr2: unknown) => {
  return _areEd25519KeysEqual(addr1 as Ed25519PublicKey, addr2 as Ed25519PublicKey)
}

const areEthereumAddressesEqual = (addr1: unknown, addr2: unknown) => {
  return _areEthereumAddressesEqual(addr1 as EthereumAddress, addr2 as EthereumAddress)
}

describe('collapseString', () => {
  test('should collapse the string with default leading and trailing characters', () => {
    const str = 'This is a long string that needs to be collapsed';
    const collapsed = collapseString(str);
    expect(collapsed).toBe('This i…psed');
  });

  test('should collapse the string with custom leading and trailing characters', () => {
    const str = 'This is a long string that needs to be collapsed';
    const collapsed = collapseString(str, 10, 8);
    expect(collapsed).toBe('This is a …ollapsed');
  });

  test('should not collapse the string if it is already short', () => {
    const str = 'Short string';
    const collapsed = collapseString(str);
    expect(collapsed).toBe(str);
  });

  test('should return an empty string if the input string is empty', () => {
    const collapsed = collapseString('');
    expect(collapsed).toBe('');
  });

  test('should return an the whole string if the input string is shorter than the leading and trailing characters', () => {
    const collapsed = collapseString('Short', 10, 8);
    expect(collapsed).toBe('Short');
  });
});

describe('areEthereumAddressesEqual', () => {
  test('should return false for 0x only strings', () => {
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', '0x')).toBe(false);
    expect(areEthereumAddressesEqual('0x', '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false);
  });

  test('should return false for wrong length strings', () => {
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c663', '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false); // 39 chars
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632a', '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false); // 41 chars
    expect(areEthereumAddressesEqual('0x742d35Cc6634C0532925a3b8D05d9E3c2c0c663', '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false); // 41 chars with 0x
    expect(areEthereumAddressesEqual('0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632a', '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false); // 43 chars with 0x
  });

  test('should return true for equal addresses', () => {
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(true);
    expect(areEthereumAddressesEqual('0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(true);
    expect(areEthereumAddressesEqual('dAC17F958D2ee523a2206206994597C13D831EC7', 'dAC17F958D2ee523a2206206994597C13D831EC7')).toBe(true);
  });

  test('should return true for mixed prefix addresses', () => {
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(true);
    expect(areEthereumAddressesEqual('0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(true);
    expect(areEthereumAddressesEqual('0xdAC17F958D2ee523a2206206994597C13D831EC7', 'dAC17F958D2ee523a2206206994597C13D831EC7')).toBe(true);
  });

  test('should return true for mixed case equal addresses', () => {
    expect(areEthereumAddressesEqual('742d35cc6634c0532925a3b8d05d9e3c2c0c6632', '742D35CC6634C0532925A3B8D05D9E3C2C0C6632')).toBe(true);
    expect(areEthereumAddressesEqual('0x742d35cc6634c0532925a3b8d05d9e3c2c0c6632', '0X742D35CC6634C0532925A3B8D05D9E3C2C0C6632')).toBe(true);
    expect(areEthereumAddressesEqual('742d35cc6634c0532925a3b8d05d9e3c2c0c6632', '0x742D35CC6634C0532925A3B8D05D9E3C2C0C6632')).toBe(true);
  });

  test('should return false for falsy addresses', () => {
    expect(areEthereumAddressesEqual('', '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false);
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', '')).toBe(false);
    expect(areEthereumAddressesEqual('', '')).toBe(false);
    expect(areEthereumAddressesEqual(undefined, '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false);
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', undefined)).toBe(false);
    expect(areEthereumAddressesEqual(undefined, undefined)).toBe(false);
    expect(areEthereumAddressesEqual(null, '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false);
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', null)).toBe(false);
    expect(areEthereumAddressesEqual(null, null)).toBe(false);
  });

  test('should return false for different addresses', () => {
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', 'dAC17F958D2ee523a2206206994597C13D831EC7')).toBe(false);
    expect(areEthereumAddressesEqual('0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', '0xdAC17F958D2ee523a2206206994597C13D831EC7')).toBe(false);
    expect(areEthereumAddressesEqual('742d35Cc6634C0532925a3b8D05d9E3c2c0c6632', '0xdAC17F958D2ee523a2206206994597C13D831EC7')).toBe(false);
  });
});

describe('areEd25519KeysEqual', () => {
  test('should return false for wrong length strings', () => {
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da2', '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(false); // 63 chars
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29a', '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(false); // 65 chars
    expect(areEd25519KeysEqual('0x3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da2', '0x3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(false); // 65 chars with 0x
    expect(areEd25519KeysEqual('0x3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29a', '0x3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(false); // 67 chars with 0x
  });

  test('should return true for equal keys', () => {
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(true);
    expect(areEd25519KeysEqual('aa3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', 'aa3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(true);
    expect(areEd25519KeysEqual('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(true);
  });

  test('should return true for mixed case equal keys', () => {
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', '3B6A27BCCEB6A42D62A3A8D02A6F0D73653215771DE243A63AC048A18B59DA29')).toBe(true);
    expect(areEd25519KeysEqual('aA3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', 'AA3B6A27BCCEB6A42D62A3A8D02A6F0D73653215771DE243A63AC048A18B59DA29')).toBe(true);
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', '0x3B6A27BCCEB6A42D62A3A8D02A6F0D73653215771DE243A63AC048A18B59DA29')).toBe(true);
  });

  test('should return false for falsy keys', () => {
    expect(areEd25519KeysEqual('', '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(false);
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', '')).toBe(false);
    expect(areEd25519KeysEqual('', '')).toBe(false);
    expect(areEd25519KeysEqual(undefined, '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(false);
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', undefined)).toBe(false);
    expect(areEd25519KeysEqual(undefined, undefined)).toBe(false);
    expect(areEd25519KeysEqual(null, '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(false);
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', null)).toBe(false);
    expect(areEd25519KeysEqual(null, null)).toBe(false);
  });

  test('should return false for different keys', () => {
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', '5a8d4e6f2c1b9a7e3d8f2a6b4c9e1d7f3a8b5c2e9f1d4a7b8e2c6f9a3d5b7c1e')).toBe(false);
    expect(areEd25519KeysEqual('aa3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', 'Aa5a8d4e6f2c1b9a7e3d8f2a6b4c9e1d7f3a8b5c2e9f1d4a7b8e2c6f9a3d5b7c1e')).toBe(false);
    expect(areEd25519KeysEqual('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29', 'aa5a8d4e6f2c1b9a7e3d8f2a6b4c9e1d7f3a8b5c2e9f1d4a7b8e2c6f9a3d5b7c1e')).toBe(false);
  });
});

describe('areBLSKeysEqual', () => {
  test('should return false for wrong length strings', () => {
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcde', '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef')).toBe(false); // 95 chars
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdefa', '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef')).toBe(false); // 97 chars
    expect(areBLSKeysEqual('aa8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcde', 'aa8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef')).toBe(false); // 97 chars with 0x
    expect(areBLSKeysEqual('aa8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdefa', 'aa8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef')).toBe(false); // 99 chars with 0x
  });

  test('should return true for equal keys', () => {
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef')).toBe(true);
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcaaf', '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcaaf')).toBe(true);
    expect(areBLSKeysEqual('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8')).toBe(true);
  });

  test('should return true for mixed case equal keys', () => {
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', '8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF')).toBe(true);
    expect(areBLSKeysEqual('0x8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', 'AA8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF')).toBe(true);
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', 'AA8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF')).toBe(true);
  });

  test('should return false for falsy keys', () => {
    expect(areBLSKeysEqual('', '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef')).toBe(false);
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', '')).toBe(false);
    expect(areBLSKeysEqual('', '')).toBe(false);
    expect(areBLSKeysEqual(undefined, '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef')).toBe(false);
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', undefined)).toBe(false);
    expect(areBLSKeysEqual(undefined, undefined)).toBe(false);
    expect(areBLSKeysEqual(null, '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef')).toBe(false);
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', null)).toBe(false);
    expect(areBLSKeysEqual(null, null)).toBe(false);
  });

  test('should return false for different keys', () => {
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8')).toBe(false);
    expect(areBLSKeysEqual('aa8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', 'aaa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8')).toBe(false);
    expect(areBLSKeysEqual('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef', 'aaa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8')).toBe(false);
  });
});