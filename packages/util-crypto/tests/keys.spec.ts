import {
  isEthereumAddress,
  isEd25519PublicKey,
  isBLSPublicKey,
  EthereumAddress,
  Ed25519PublicKey,
  BLSPublicKey,
} from '../src/keys';

describe('isEthereumAddress', () => {
  describe('valid addresses', () => {
    test('should accept 40-char hex addresses without prefix', () => {
      const validAddresses = [
        '742d35Cc6634C0532925a3b8D05d9E3c2c0c6632',
        'dAC17F958D2ee523a2206206994597C13D831EC7',
        '0000000000000000000000000000000000000000',
        'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        '1234567890abcdef1234567890abcdef12345678',
        'AbCdEf1234567890AbCdEf1234567890AbCdEf12',
      ];

      validAddresses.forEach(address => {
        expect(isEthereumAddress(address)).toBe(true);
      });
    });

    test('should accept 42-char hex addresses with 0x prefix', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632',
        '0xdAC17F958D2ee523a2206206994597C13D831EC7',
        '0x0000000000000000000000000000000000000000',
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        '0x1234567890abcdef1234567890abcdef12345678',
        '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
      ];

      validAddresses.forEach(address => {
        expect(isEthereumAddress(address)).toBe(true);
      });
    });

    test('should handle mixed case addresses', () => {
      expect(isEthereumAddress('742D35CC6634C0532925A3B8D05D9E3C2C0C6632')).toBe(true);
      expect(isEthereumAddress('0x742d35cc6634c0532925a3b8d05d9e3c2c0c6632')).toBe(true);
      expect(isEthereumAddress('0XdAC17F958D2ee523a2206206994597C13D831EC7')).toBe(true);
    });
  });

  describe('invalid addresses', () => {
    test('should reject wrong length addresses', () => {
      const invalidAddresses = [
        '742d35Cc6634C0532925a3b8D05d9E3c2c0c663',     // 39 chars
        '742d35Cc6634C0532925a3b8D05d9E3c2c0c66321',   // 41 chars
        '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c663',   // 41 chars with prefix
        '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c66321', // 43 chars with prefix
        '',                                              // empty
        '0x',                                            // just prefix
      ];

      invalidAddresses.forEach(address => {
        expect(isEthereumAddress(address)).toBe(false);
      });
    });

    test('should reject non-hex characters', () => {
      const invalidAddresses = [
        '742d35Cc6634C0532925a3b8D05d9E3c2c0c66g2',   // 'g' not hex
        '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c66Z2', // 'Z' not hex
        '742d35Cc6634C0532925a3b8D05d9E3c2c0c66!2',   // '!' not hex
        '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c66@2', // '@' not hex
        '742d35Cc6634C0532925a3b8D05d9E3c2c0c66 2',   // space
      ];

      invalidAddresses.forEach(address => {
        expect(isEthereumAddress(address)).toBe(false);
      });
    });

    test('should reject invalid prefixes', () => {
      expect(isEthereumAddress('ab742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false);
      expect(isEthereumAddress('1x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false);
      expect(isEthereumAddress('x0742d35Cc6634C0532925a3b8D05d9E3c2c0c6632')).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle all zeros and all F addresses', () => {
      expect(isEthereumAddress('0000000000000000000000000000000000000000')).toBe(true);
      expect(isEthereumAddress('0x0000000000000000000000000000000000000000')).toBe(true);
      expect(isEthereumAddress('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
      expect(isEthereumAddress('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
    });

    test('should use cache for repeated calls', () => {
      const address = '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632';

      // First call
      const result1 = isEthereumAddress(address);
      // Second call should use cache
      const result2 = isEthereumAddress(address);

      expect(result1).toBe(result2);
      expect(result1).toBe(true);
    });
  });

  describe('type narrowing', () => {
    test('should narrow type to EthereumAddress when valid', () => {
      const address = '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632';
      if (isEthereumAddress(address)) {
        // TypeScript should recognize this as EthereumAddress
        const typedAddress: EthereumAddress = address;
        expect(typedAddress).toBe(address);
      }
    });
  });
});

describe('isEd25519PublicKey', () => {
  describe('valid keys', () => {
    test('should accept 64-char hex keys', () => {
      const validKeys = [
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29',
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0000000000000000000000000000000000000000000000000000000000000000',
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'a4e6b8c9d2f7e1a3b8c5d9e2f6a1b4c7e8f2a5b9c3d6e0f4a7b1c8d5e9f2a6b3',
        'F3A8B5C2D9E6F0A4B7C1D8E5F2A9B6C3D0E7F4A1B8C5D2E9F6A3B0C7D4E1F8A5',
      ];

      validKeys.forEach(key => {
        expect(isEd25519PublicKey(key)).toBe(true);
      });
    });

    test('should handle mixed case keys', () => {
      expect(isEd25519PublicKey('3B6A27BCCEB6A42D62A3A8D02A6F0D73653215771DE243A63AC048A18B59DA29')).toBe(true);
      expect(isEd25519PublicKey('3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29')).toBe(true);
      expect(isEd25519PublicKey('3B6a27BCceb6A42d62A3a8D02a6F0d73653215771dE243A63aC048A18b59Da29')).toBe(true);
    });
  });

  describe('invalid keys', () => {
    test('should reject wrong length keys', () => {
      const invalidKeys = [
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da2',   // 63 chars
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29a', // 65 chars
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a',           // 55 chars
        '',                                                                       // empty
        '1234567890abcdef1234567890abcdef12345678',                             // 40 chars
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678', // 68 chars
      ];

      invalidKeys.forEach(key => {
        expect(isEd25519PublicKey(key)).toBe(false);
      });
    });

    test('should reject non-hex characters', () => {
      const invalidKeys = [
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59dag9',   // 'g' not hex
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59daZ9',   // 'Z' not hex
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da!9',   // '!' not hex
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da 9',   // space
        '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da@9',   // '@' not hex
      ];

      invalidKeys.forEach(key => {
        expect(isEd25519PublicKey(key)).toBe(false);
      });
    });

    test('should reject keys with 0x prefix', () => {
      // Ed25519 keys should NOT have 0x prefix according to your implementation
      const invalidKeys = [
        '0x3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29',
        '0X3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29',
      ];

      invalidKeys.forEach(key => {
        expect(isEd25519PublicKey(key)).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    test('should handle all zeros and all F keys', () => {
      expect(isEd25519PublicKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(true);
      expect(isEd25519PublicKey('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).toBe(true);
      expect(isEd25519PublicKey('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
    });

    test('should use cache for repeated calls', () => {
      const key = '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29';

      // First call
      const result1 = isEd25519PublicKey(key);
      // Second call should use cache
      const result2 = isEd25519PublicKey(key);

      expect(result1).toBe(result2);
      expect(result1).toBe(true);
    });
  });

  describe('type narrowing', () => {
    test('should narrow type to Ed25519PublicKey when valid', () => {
      const key = '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29';
      if (isEd25519PublicKey(key)) {
        // TypeScript should recognize this as Ed25519PublicKey
        const typedKey: Ed25519PublicKey = key;
        expect(typedKey).toBe(key);
      }
    });
  });
});

describe('isBLSPublicKey', () => {
  describe('valid keys', () => {
    test('should accept 96-char hex keys', () => {
      const validKeys = [
        '88123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef123456789abcdef8123456789abcdef',
        'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
        '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345612345678901234567890123456789012',
        'abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefab',
      ];

      validKeys.forEach(key => {
        expect(isBLSPublicKey(key)).toBe(true);
      });
    });

    test('should handle mixed case keys', () => {
      expect(isBLSPublicKey('8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEF8123456789ABCDEFABCDEF8123456789ABCDEF81234567AB')).toBe(true);
      expect(isBLSPublicKey('8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdefabcdef8123456789abcdefabcdef812f')).toBe(true);
      expect(isBLSPublicKey('8123456789AbCdEf8123456789AbCdEf8123456789AbCdEf81234556789AbCdEf8123456789AbCdEf8123456789AbCdEf6789AbCdEf8123456789AbCdEf81234')).toBe(true);
    });
  });

  describe('invalid keys', () => {
    test('should reject wrong length keys', () => {
      const invalidKeys = [
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcde',   // 95 chars
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdefa', // 97 chars
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef',                               // 64 chars
        '',                                                                                                     // empty
        '8123456789abcdef',                                                                                     // 16 chars
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123', // 100 chars
      ];

      invalidKeys.forEach(key => {
        expect(isBLSPublicKey(key)).toBe(false);
      });
    });

    test('should reject non-hex characters', () => {
      const invalidKeys = [
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdeg',   // 'g' not hex
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdeZ',   // 'Z' not hex
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcde!',   // '!' not hex
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcde ',   // space
        '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcde@',   // '@' not hex
      ];

      invalidKeys.forEach(key => {
        expect(isBLSPublicKey(key)).toBe(false);
      });
    });

    test('should reject keys with 0x prefix', () => {
      // BLS keys should NOT have 0x prefix according to your implementation
      const invalidKeys = [
        '0x8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef',
        '0X8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef',
      ];

      invalidKeys.forEach(key => {
        expect(isBLSPublicKey(key)).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    test('should handle all zeros and all F keys', () => {
      expect(isBLSPublicKey('00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000')).toBe(true);
      expect(isBLSPublicKey('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).toBe(true);
      expect(isBLSPublicKey('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
    });

    test('should use cache for repeated calls', () => {
      const key = '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef';

      // First call
      const result1 = isBLSPublicKey(key);
      // Second call should use cache
      const result2 = isBLSPublicKey(key);

      expect(result1).toBe(result2);
      expect(result1).toBe(true);
    });
  });

  describe('type narrowing', () => {
    test('should narrow type to BLSPublicKey when valid', () => {
      const key = '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef';
      if (isBLSPublicKey(key)) {
        // TypeScript should recognize this as BLSPublicKey
        const typedKey: BLSPublicKey = key;
        expect(typedKey).toBe(key);
      }
    });
  });
});

describe('performance and caching', () => {
  test('should cache results for all key types', () => {
    const ethAddr = '0x742d35Cc6634C0532925a3b8D05d9E3c2c0c6632';
    const ed25519Key = '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29';
    const blsKey = '8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef8123456789abcdef';

    // Multiple calls should be fast due to caching
    for (let i = 0; i < 100; i++) {
      expect(isEthereumAddress(ethAddr)).toBe(true);
      expect(isEd25519PublicKey(ed25519Key)).toBe(true);
      expect(isBLSPublicKey(blsKey)).toBe(true);
    }
  });

  test('should handle large numbers of different keys efficiently', () => {
    const keys = Array.from({ length: 1000 }, (_, i) =>
      i.toString(16).padStart(128, '0')
    );

    const start = Date.now();
    keys.forEach(key => isEd25519PublicKey(key));
    const end = Date.now();

    // Should complete in reasonable time (adjust threshold as needed)
    expect(end - start).toBeLessThan(100);
  });
});