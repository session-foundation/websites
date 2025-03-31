'use client';

import ClaimTokensModule from '@/app/mystakes/modules/ClaimTokensModule';
import { useActiveVestingContractAddress } from '@/providers/vesting-provider';
import { UndoIcon } from '@session/ui/icons/UndoIcon';
import { useTranslations } from 'next-intl';

export default function VestingReturnStakesModule() {
  return (
    <ClaimTokensModule
      addressOverride={useActiveVestingContractAddress()}
      dictionary={useTranslations('vesting.modules.returnStakes')}
      textClassName="text-2xl"
      iconOverride={UndoIcon}
      iconStrokeForFill
    />
  );
}
