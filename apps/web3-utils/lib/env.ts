import { isProduction as isProductionEnv } from '@session/util-js/env';

export const NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID =
  // biome-ignore lint/style/noNonNullAssertion: This is intended
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;
if (!NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is required');
}

export const NEXT_PUBLIC_BRANDED = process.env.NEXT_PUBLIC_BRANDED === 'true';

export const isProduction = isProductionEnv();
