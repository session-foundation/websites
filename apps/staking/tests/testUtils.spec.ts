import { CONTRACT_ADDRESS, ED25519_ADDRESS, WALLET_ADDRESS } from '../tests/testUtils';
import { isEd25519PublicKey } from '@session/staking-api-js/refine';
import { isAddress } from 'viem';

describe('address utils', () => {
  it('should have valid ethereum addresses', () => {
    expect(isAddress(WALLET_ADDRESS[1] ?? '')).toBe(true);
    expect(isAddress(CONTRACT_ADDRESS[1] ?? '')).toBe(true);
  });
  it('should have valid ed25519 addresses', () => {
    expect(isEd25519PublicKey(ED25519_ADDRESS[1] ?? '')).toBe(true);
  });
});
