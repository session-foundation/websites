'use client';

import UnclaimedTokensModule from '@/app/mystakes/modules/UnclaimedTokensModule';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { useTranslations } from 'next-intl';

export default function VestingUnclaimedStakesModule() {
  return (
    <UnclaimedTokensModule
      addressOverride={useActiveVestingContractAddress()}
      titleOverride={useTranslations('vesting.modules.unclaimedStakes')('title')}
    />
  );
}
