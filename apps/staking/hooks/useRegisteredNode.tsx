import {
  useStakingBackendQueryWithParams,
  useStakingBackendSuspenseQuery,
} from '@/lib/staking-api-client';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { getStakedNodes } from '@/lib/queries/getStakedNodes';
import { getNodes } from '@/lib/queries/getNodes';
import { useMemo } from 'react';
import { areHexesEqual } from '@session/util-crypto/string';
import { getUnixTimestampNowSeconds } from '@session/util-js/date';
import { useWallet } from '@session/wallet/hooks/useWallet';

export const useRegisteredNode = ({ pubKeyEd25519 }: { pubKeyEd25519?: string }) => {
  const { address } = useWallet();
  const { data: openData } = useStakingBackendSuspenseQuery(getContributionContracts);
  const { data: runningData } = useStakingBackendSuspenseQuery(getNodes);
  const { data: stakedData } = useStakingBackendQueryWithParams(
    getStakedNodes,
    {
      address: address!,
    },
    { enabled: !!address }
  );

  const openNode = useMemo(() => {
    if (openData && 'nodes' in openData && Array.isArray(openData.nodes)) {
      return openData.nodes.find((node) => areHexesEqual(node.service_node_pubkey, pubKeyEd25519));
    }
    return null;
  }, [openData, pubKeyEd25519]);

  const runningNode = useMemo(() => {
    if (runningData && 'nodes' in runningData && Array.isArray(runningData.nodes)) {
      return runningData.nodes.find((node) =>
        areHexesEqual(node.service_node_pubkey, pubKeyEd25519)
      );
    }
    return null;
  }, [runningData, pubKeyEd25519]);

  const stakedNode = useMemo(() => {
    if (stakedData && 'stakes' in stakedData && Array.isArray(stakedData.stakes)) {
      return stakedData.stakes.find((stake) =>
        areHexesEqual(stake.service_node_pubkey, pubKeyEd25519)
      );
    }
    return null;
  }, [stakedData, pubKeyEd25519]);

  const networkTime = useMemo(
    () =>
      stakedData?.network.block_timestamp ??
      runningData?.network.block_timestamp ??
      getUnixTimestampNowSeconds(),
    [stakedData, runningData]
  );

  const blockHeight = useMemo(
    () => stakedData?.network?.block_height ?? runningData?.network.block_height ?? 0,
    [stakedData, runningData]
  );

  return {
    found: !!(openNode || stakedNode || runningNode),
    openNode,
    stakedNode,
    runningNode,
    networkTime,
    blockHeight,
  };
};
