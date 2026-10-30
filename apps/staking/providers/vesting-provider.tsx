'use client';

import { useVestingContracts } from '@/hooks/useVestingContracts';
import { DYNAMIC_LINKS, PREFERENCE, VESTING_PATHS } from '@/lib/constants';
import logger from '@/lib/logger';
import type { VestingContract } from '@session/staking-api-js/schema';
import { jsonBigIntReplacer, jsonBigIntReviver } from '@session/util-js/bigint';
import { usePathname, useRouter } from 'next/navigation';
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usePreferences } from 'usepref';
import { isAddress } from 'viem';

function saveVestingContract(contract: VestingContract) {
  localStorage.setItem('vestingContract', JSON.stringify(contract, jsonBigIntReplacer));
}

function removeVestingContract() {
  localStorage.removeItem('vestingContract');
}

function loadVestingContract(): VestingContract | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedContract = localStorage.getItem('vestingContract');
  if (!storedContract) return null;

  return JSON.parse(storedContract, jsonBigIntReviver);
}

const VESTING_POPUP_SNOOZE_KEY = 'vestingPopupSnooze';
const VESTING_POPUP_SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

type VestingPopupSnooze = {
  until: number;
  /** Lowercase addresses of the contracts the snooze applies to. */
  addresses: Array<string>;
};

function saveVestingPopupSnooze(contracts: Array<VestingContract>) {
  const snooze: VestingPopupSnooze = {
    until: Date.now() + VESTING_POPUP_SNOOZE_MS,
    addresses: contracts.map(({ address }) => address.toLowerCase()),
  };
  localStorage.setItem(VESTING_POPUP_SNOOZE_KEY, JSON.stringify(snooze));
}

/** A snooze lapses early when the wallet gains a contract it didn't cover. */
function isVestingPopupSnoozed(contracts: Array<VestingContract>) {
  try {
    const stored = localStorage.getItem(VESTING_POPUP_SNOOZE_KEY);
    if (!stored) return false;
    const { until, addresses } = JSON.parse(stored) as VestingPopupSnooze;
    return (
      Date.now() < until &&
      contracts.every(({ address }) => addresses.includes(address.toLowerCase()))
    );
  } catch (error) {
    logger.error(error);
    return false;
  }
}

type VestingContext = {
  contracts: Array<VestingContract>;
  activeContract: VestingContract | null;
  showVestingSelectionDialog: boolean;
  setShowVestingSelectionDialog: Dispatch<SetStateAction<boolean>>;
  disconnectFromVestingContract: () => void;
  snoozeVestingSelectionDialog: () => void;
  connectToVestingContract: (contract: VestingContract) => void;
  refetch: () => void;
  isLoading: boolean;
};

const Context = createContext<VestingContext | undefined>(undefined);

export default function VestingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getItem } = usePreferences();

  const [activeContract, setActiveContract] = useState<VestingContract | null>(
    loadVestingContract()
  );
  const [showVestingSelectionDialog, setShowVestingSelectionDialog] = useState<boolean>(false);
  const [skipped, setSkipped] = useState<boolean>(false);

  const { contracts, refetch, enabled, isLoading } = useVestingContracts();
  const stakesLoaded = enabled && !isLoading;

  const disconnectFromVestingContract = useCallback(() => {
    logger.debug('Disconnecting from vesting contract');
    setSkipped(true);
    setActiveContract(null);
    // setShowVestingSelectionDialog must be called after setActiveContract or the dialog will pop up for a moment
    setShowVestingSelectionDialog(false);
    removeVestingContract();

    if (pathname.startsWith(DYNAMIC_LINKS.vestedStakes.href)) {
      router.push(DYNAMIC_LINKS.myStakes.href);
    }
  }, [pathname, router]);

  const snoozeVestingSelectionDialog = useCallback(() => {
    saveVestingPopupSnooze(contracts);
    disconnectFromVestingContract();
  }, [contracts, disconnectFromVestingContract]);

  const connectToVestingContract = useCallback(
    (contract: VestingContract) => {
      logger.debug(`Connecting to vesting contract: ${contract.address}`);
      setShowVestingSelectionDialog(false);
      setActiveContract(contract);
      saveVestingContract(contract);

      if (pathname.startsWith(DYNAMIC_LINKS.myStakes.href)) {
        router.push(DYNAMIC_LINKS.vestedStakes.href);
      }
    },
    [pathname, router]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies(pathname.startsWith): Don't re-trigger when pathname changes
  // biome-ignore lint/correctness/useExhaustiveDependencies(router.push): Don't re-trigger when router changes
  // biome-ignore lint/correctness/useExhaustiveDependencies(getItem): Don't re-trigger getItem changes
  // biome-ignore lint/correctness/useExhaustiveDependencies(skipped): Don't re-trigger when skip changes
  useEffect(() => {
    if (stakesLoaded) {
      if (
        !activeContract &&
        contracts?.length &&
        !getItem<boolean>(PREFERENCE.SKIP_VESTING_POPUP_ON_STARTUP) &&
        !isVestingPopupSnoozed(contracts) &&
        VESTING_PATHS.some((path) => pathname.startsWith(path))
      ) {
        if (!skipped) {
          setShowVestingSelectionDialog(true);
        }
        if (pathname.startsWith(DYNAMIC_LINKS.vestedStakes.href)) {
          router.push(DYNAMIC_LINKS.myStakes.href);
        }
      } else {
        if (activeContract && pathname.startsWith(DYNAMIC_LINKS.myStakes.href)) {
          router.push(DYNAMIC_LINKS.vestedStakes.href);
        }
      }
    }
  }, [activeContract, contracts, stakesLoaded]);

  return (
    <Context.Provider
      value={{
        contracts,
        activeContract,
        showVestingSelectionDialog,
        setShowVestingSelectionDialog,
        disconnectFromVestingContract,
        snoozeVestingSelectionDialog,
        connectToVestingContract,
        refetch,
        isLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useVesting = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useVesting must be used inside VestingProvider');
  }

  return context;
};

export const useActiveVestingContract = () => useVesting().activeContract;

export const useActiveVestingContractAddress = () => useVesting().activeContract?.address;

export const useConnectedVestingContract = () => {
  const activeContract = useActiveVestingContract();

  if (!activeContract?.address || !isAddress(activeContract.address)) {
    throw new Error('No active vesting contract address');
  }

  return activeContract;
};
