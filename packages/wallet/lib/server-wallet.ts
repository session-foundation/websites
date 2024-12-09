import { Address, type Chain, createPublicClient, createWalletClient, http } from 'viem';
import { nonceManager, privateKeyToAccount } from 'viem/accounts';

export function createServerWallet(privateKey: Address, chain: Chain) {
  if (!privateKey) {
    throw new Error('Private key is required to create a server wallet');
  }

  const account = privateKeyToAccount(privateKey, { nonceManager });

  return createWalletClient({
    account,
    chain,
    transport: http(),
  });
}

export function createPublicWalletClient(chain: Chain) {
  return createPublicClient({
    chain,
    transport: http(),
  });
}
