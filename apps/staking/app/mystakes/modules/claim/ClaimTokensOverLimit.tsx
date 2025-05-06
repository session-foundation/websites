import { WizardSectionDescription } from '@/components/Wizard';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import useRelativeTime from '@/hooks/useRelativeTime';
import { URL } from '@/lib/constants';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { Address } from 'viem';

export function ClaimTokensOverLimit({ address }: { address: Address }) {
  const dict = useTranslations('infoNotice');
  const { networkClaimPeriodEnd } = useNetworkBalances({ addressOverride: address });
  const periodEndDate = useMemo(() => new Date(networkClaimPeriodEnd), [networkClaimPeriodEnd]);

  const relativeTime = useRelativeTime(periodEndDate, { addSuffix: true });

  return (
    <div className="mb-4 text-center">
      <WizardSectionDescription
        description={dict('claimLimitInfo', { linkOut: '' })}
        href={URL.DOCS}
      />
      <br />
      {dict.rich('claimLimitCountdown', {
        relativeTime,
      })}
    </div>
  );
}
