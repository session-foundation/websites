import {
  http,
  type Address,
  type Chain,
  type HttpTransport,
  type PrivateKeyAccount,
  type WalletClient,
  createPublicClient,
  createWalletClient,
} from 'viem';
import { nonceManager, privateKeyToAccount } from 'viem/accounts';

export function createServerWallet(
  privateKey: Address,
  chain: Chain
): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
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
  const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;
  return createPublicClient({
    chain,
    transport: http(RPC_URL),
  });
}
