import { BlockTimeManager } from '@/lib/blocks';
import { getHardForkInfo } from '@/lib/queries/getHardForkInfo';
import { useStakingBackendQuery } from '@/lib/staking-api-client';
import { useCallback, useMemo } from 'react';

export enum VERSION {
  MAJOR = 0,
  MINOR = 1,
  PATCH = 2,
  UNKNOWN = 3,
  UP_TO_DATE = 4,
}

function getLatestVersionArray(str: string): Array<number> | null {
  const numArr = str.split('-')[0]?.split('.').map(Number).filter(Number.isFinite);
  return numArr ?? null;
}

export const useNetworkVersionInfo = () => {
  const { data } = useStakingBackendQuery(getHardForkInfo, {
    enabled: true,
  });

  const { blocksRemaining, date, latestVersion } = useMemo(() => {
    let blocksRemaining: number | null = null;
    let date: Date | null = null;
    let latestVersion: Array<number> | null = null;

    if (data) {
      const blockTime = new BlockTimeManager(
        data.network.block_timestamp,
        data.network.block_height
      );

      const hardForkBlock = data.version_info.earliest_height;

      latestVersion = getLatestVersionArray(data.network.version);

      if (hardForkBlock) {
        blocksRemaining = hardForkBlock - data.network.block_height;
        date = blockTime.getDateOfBlock(hardForkBlock);
      }
    }

    return {
      blocksRemaining,
      date,
      latestVersion,
    };
  }, [data]);

  const checkForUpdate = useCallback(
    (version: Array<number>): VERSION => {
      if (!latestVersion?.length || !version?.length) {
        return VERSION.UNKNOWN;
      }

      for (let i = 0; i < Math.max(latestVersion.length, 3); i++) {
        const latestVersionDigit = latestVersion[i];
        const compVersionDigit = version[i];

        if (latestVersionDigit === undefined || compVersionDigit === undefined) {
          continue;
        }

        if (latestVersionDigit > compVersionDigit) {
          return i;
        }
      }

      return VERSION.UP_TO_DATE;
    },
    [latestVersion]
  );

  return {
    hardForkDate: date,
    hardForkBlocksRemaining: blocksRemaining,
    hardForkInFuture: blocksRemaining !== null && blocksRemaining > 0,
    latestVersion,
    checkForUpdate,
  };
};
