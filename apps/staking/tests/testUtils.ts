import { ARBITRUM_EVENT } from '@session/staking-api-js/enums';
import type { Ed25519PublicKey } from '@session/staking-api-js/refine';
import type {
  ArbitrumEvent,
  ContributionContractContributor,
} from '@session/staking-api-js/schema';
import type { Address } from 'viem';

const WALLET_ADDR_START = `0x${'0'.repeat(37)}a`;
const CONTRACT_ADDR_START = `0x${'0'.repeat(37)}c`;
const ED25519_ADDR_START = '0'.repeat(62);
const BLS_KEY_START = '0'.repeat(126);

export const WALLET_ADDRESS = {
  1: `${WALLET_ADDR_START}0a` as Address,
  2: `${WALLET_ADDR_START}0b` as Address,
  3: `${WALLET_ADDR_START}0c` as Address,
  4: `${WALLET_ADDR_START}0d` as Address,
  5: `${WALLET_ADDR_START}0e` as Address,
  6: `${WALLET_ADDR_START}0f` as Address,
  7: `${WALLET_ADDR_START}10` as Address,
  8: `${WALLET_ADDR_START}11` as Address,
  9: `${WALLET_ADDR_START}12` as Address,
};

export const CONTRACT_ADDRESS = {
  1: `${CONTRACT_ADDR_START}0a` as Address,
  2: `${CONTRACT_ADDR_START}0b` as Address,
  3: `${CONTRACT_ADDR_START}0c` as Address,
  4: `${CONTRACT_ADDR_START}0d` as Address,
  5: `${CONTRACT_ADDR_START}0e` as Address,
  6: `${CONTRACT_ADDR_START}0f` as Address,
  7: `${CONTRACT_ADDR_START}10` as Address,
  8: `${CONTRACT_ADDR_START}11` as Address,
  9: `${CONTRACT_ADDR_START}12` as Address,
};

export const ED25519_ADDRESS = {
  1: `${ED25519_ADDR_START}0a` as Ed25519PublicKey,
  2: `${ED25519_ADDR_START}0b` as Ed25519PublicKey,
  3: `${ED25519_ADDR_START}0c` as Ed25519PublicKey,
  4: `${ED25519_ADDR_START}0d` as Ed25519PublicKey,
  5: `${ED25519_ADDR_START}0e` as Ed25519PublicKey,
  6: `${ED25519_ADDR_START}0f` as Ed25519PublicKey,
  7: `${ED25519_ADDR_START}10` as Ed25519PublicKey,
  8: `${ED25519_ADDR_START}11` as Ed25519PublicKey,
  9: `${ED25519_ADDR_START}12` as Ed25519PublicKey,
};

export const BLS_KEY = {
  1: `${BLS_KEY_START}0a` as string,
  2: `${BLS_KEY_START}0b` as string,
  3: `${BLS_KEY_START}0c` as string,
  4: `${BLS_KEY_START}0d` as string,
  5: `${BLS_KEY_START}0e` as string,
  6: `${BLS_KEY_START}0f` as string,
  7: `${BLS_KEY_START}10` as string,
  8: `${BLS_KEY_START}11` as string,
  9: `${BLS_KEY_START}12` as string,
};

export const DEPLOY_ARB_EVENT = (block: number) => {
  return {
    name: ARBITRUM_EVENT.NewServiceNodeContributionContract,
    block,
  } as ArbitrumEvent;
};
export const FINALIZED_ARB_EVENT = (block: number) => {
  return {
    name: ARBITRUM_EVENT.Finalized,
    block,
  } as ArbitrumEvent;
};
export const CONTRIBUTOR = (address: Address, amount = 0n, reserved = 0n) => {
  return {
    address,
    beneficiary_address: address,
    amount,
    reserved,
  } as ContributionContractContributor;
};
