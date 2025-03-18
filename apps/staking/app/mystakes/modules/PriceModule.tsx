'use client';

import ReferralModule from '@/app/mystakes/modules/ReferralModule';
import {
  Module,
  ModuleContent,
  ModuleHeader,
  ModuleText,
  ModuleTitle,
} from '@session/ui/components/Module';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { arbitrumSepolia } from 'viem/chains';

export default function PriceModule() {
  const { chainId } = useWallet();
  const dictionary = useTranslations('modules.price');
  const generalDictionary = useTranslations('general');
  const titleFormat = useTranslations('modules.title');

  const title = dictionary('title');

  if (chainId === arbitrumSepolia.id) {
    return <ReferralModule />;
  }

  return (
    <Module size="lg" className="hidden flex-grow lg:flex">
      <ModuleHeader variant="overlay">
        <ModuleTitle>{titleFormat('format', { title })}</ModuleTitle>
        <ModuleText>{generalDictionary('comingSoon')}</ModuleText>
      </ModuleHeader>
      <ModuleContent className="h-full min-h-12" />
    </Module>
  );
}
