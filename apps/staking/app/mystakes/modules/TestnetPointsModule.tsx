'use client';

import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Module, ModuleTitle, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { ModuleDynamicQueryText } from '@/components/ModuleDynamic';
import type { QUERY_STATUS } from '@/lib/query';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@session/ui/lib/toast';
import { areHexesEqual } from '@session/util-crypto/string';
import { formatNumber, formatPercentage } from '@/lib/locale-client';
import type { AddressModuleProps } from '@/app/mystakes/modules/types';

const noPointsObject = {
  score: 0,
  percent: 0,
};

export default function TestnetPointsModule(params?: AddressModuleProps) {
  const dictionary = useTranslations('modules.points');
  const dictionaryShared = useTranslations('modules.shared');
  const toastDictionary = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');
  const title = dictionary('title');

  const { address: connectedAddress } = useWallet();
  const address = useMemo(
    () => params?.addressOverride ?? connectedAddress,
    [params?.addressOverride, connectedAddress]
  );

  const { data, status, refetch } = useQuery({
    queryKey: ['points', address],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_POINTS_PROGRAM_API!);

      if (!res.ok) {
        toast.error('Failed to fetch points');
      }

      const data = await res.json();
      if (!data?.wallets) return noPointsObject;

      const pointsData = Object.entries(data.wallets).find(([wallet]) =>
        areHexesEqual(wallet, address)
      );

      if (!pointsData || !pointsData[1]) return noPointsObject;

      return pointsData[1] as { score: number; percent: number };
    },
  });

  const points = `${formatNumber(data?.score ?? 0)} points`;

  return (
    <Module>
      <ModuleTooltip>
        {dictionary.rich('description', {
          link: externalLink(URL.SESSION_TOKEN_COMMUNITY_SNAPSHOT),
        })}
      </ModuleTooltip>
      {/* We don't care that it hydrates differently based on client locale. */}
      <ModuleTitle suppressHydrationWarning>
        {titleFormat('format', { title })}
        {` (${formatPercentage((data?.percent ?? 0) / 100, { maximumSignificantDigits: 2 })})`}
      </ModuleTitle>
      <ModuleDynamicQueryText
        status={status as QUERY_STATUS}
        fallback={0}
        enabled
        errorFallback={dictionaryShared('error')}
        errorToast={{
          messages: {
            error: toastDictionary('error', { module: title }),
            refetching: toastDictionary('refetching'),
            success: toastDictionary('refetchSuccess', { module: title }),
          },
          refetch,
        }}
      >
        {points}
      </ModuleDynamicQueryText>
    </Module>
  );
}
