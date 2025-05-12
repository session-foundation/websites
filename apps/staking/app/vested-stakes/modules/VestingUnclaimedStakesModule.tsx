'use client';

import UnclaimedStakesModule from '@/app/mystakes/modules/UnclaimedStakesModule';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { useTranslations } from 'next-intl';

export default function VestingUnclaimedStakesModule() {
  return (
    <UnclaimedStakesModule
      addressOverride={useActiveVestingContractAddress()}
      titleOverride={useTranslations('vesting.modules.unclaimedStakes')('title')}
    />
  );
}
