'use client';

import { useStakes } from '@/hooks/useStakes';
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

type VestingContext = {
  contracts: Array<VestingContract>;
  activeContract: VestingContract | null;
  showVestingSelectionDialog: boolean;
  setShowVestingSelectionDialog: Dispatch<SetStateAction<boolean>>;
  disconnectFromVestingContract: () => void;
  connectToVestingContract: (contract: VestingContract) => void;
  refetch: () => void;
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

  const { vesting, refetch, enabled, isLoading } = useStakes();
  const stakesLoaded = enabled && !isLoading;

  const disconnectFromVestingContract = useCallback(() => {
    logger.debug('Disconnecting from vesting contract');
    setActiveContract(null);
    // setShowVestingSelectionDialog must be called after setActiveContract or the dialog will pop up for a moment
    setShowVestingSelectionDialog(false);
    removeVestingContract();

    if (pathname.startsWith(DYNAMIC_LINKS.vestedStakes.href)) {
      router.push(DYNAMIC_LINKS.myStakes.href);
    }
  }, [pathname, router]);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Don't re-trigger when pathname changes or pref changes
  useEffect(() => {
    if (stakesLoaded) {
      if (
        !activeContract &&
        vesting?.length &&
        !getItem<boolean>(PREFERENCE.SKIP_VESTING_POPUP_ON_STARTUP) &&
        VESTING_PATHS.some((path) => pathname.startsWith(path))
      ) {
        setShowVestingSelectionDialog(true);
        if (pathname.startsWith(DYNAMIC_LINKS.vestedStakes.href)) {
          router.push(DYNAMIC_LINKS.myStakes.href);
        }
      } else {
        if (activeContract && pathname.startsWith(DYNAMIC_LINKS.myStakes.href)) {
          router.push(DYNAMIC_LINKS.vestedStakes.href);
        }
      }
    }
  }, [activeContract, vesting, stakesLoaded]);

  return (
    <Context.Provider
      value={{
        contracts: vesting,
        activeContract,
        showVestingSelectionDialog,
        setShowVestingSelectionDialog,
        disconnectFromVestingContract,
        connectToVestingContract,
        refetch,
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
