'use client';

import { WizardSectionDescription } from '@/components/Wizard';
import { useNetworkVersionInfo } from '@/hooks/useNetworkVersionInfo';
import useRelativeTime from '@/hooks/useRelativeTime';
import { URL } from '@/lib/constants';
import { Banner } from '@session/ui/components/Banner';
import { useTranslations } from 'next-intl';

export default function HardForkBanner() {
  const dict = useTranslations('banner');

  const { hardForkDate, hardForkInFuture } = useNetworkVersionInfo();

  const relativeTime = useRelativeTime(hardForkDate, { addSuffix: true });

  if (!hardForkInFuture) {
    return null;
  }

  return (
    <Banner>
      <WizardSectionDescription
        className="inline-flex items-center"
        invertColors
        description={dict.rich('hardFork', {
          linkOut: '',
          relativeTime,
        })}
        href={URL.SESSION_NODE_UPDATE_DOCS}
      />
    </Banner>
  );
}
