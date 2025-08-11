import { isProduction as isProductionEnv } from '@session/util-js/env';

export const NEXT_PUBLIC_BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
if (!NEXT_PUBLIC_BACKEND_API_URL) {
  throw new Error('NEXT_PUBLIC_BACKEND_API_URL is required');
}

export const NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;
if (!NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is required');
}

export const NEXT_PUBLIC_RPC_URL_ARB = process.env.NEXT_PUBLIC_RPC_URL_ARB;
export const NEXT_PUBLIC_RPC_BATCH_ARB = process.env.NEXT_PUBLIC_RPC_URL_ARB === 'true';
export const NEXT_PUBLIC_RPC_URL_ETH = process.env.NEXT_PUBLIC_RPC_URL_ETH;
export const NEXT_PUBLIC_RPC_BATCH_ETH = process.env.NEXT_PUBLIC_RPC_URL_ETH === 'true';

export const NEXT_PUBLIC_PRICE_TOKEN = process.env.NEXT_PUBLIC_PRICE_TOKEN!;
if (!NEXT_PUBLIC_PRICE_TOKEN) {
  throw new Error('NEXT_PUBLIC_PRICE_TOKEN is required');
}

export const NEXT_PUBLIC_TESTNET = process.env.NEXT_PUBLIC_TESTNET === 'true';

export const isProduction = isProductionEnv();
