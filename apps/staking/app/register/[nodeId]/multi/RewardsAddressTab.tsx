import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React from 'react';

export function RewardsAddressTab() {
  const dictionary = useTranslations('actionModules.registration.rewardsAddress');
  const { changeTab } = useRegistrationWizard();

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        data-testid={ButtonDataTestId.Registration_Rewards_Address_Same}
        aria-label={dictionary('buttonSame.aria')}
        onClick={() => changeTab(REG_TAB.AUTO_ACTIVATE)}
        // TODO: Implement reserve slots
        // onClick={() => changeTab(REG_TAB.RESERVE_SLOTS)}
      >
        {dictionary('buttonSame.text')}
      </Button>
      <Button
        data-testid={ButtonDataTestId.Registration_Rewards_Address_Different}
        aria-label={dictionary('buttonDifferent.aria')}
        onClick={() => changeTab(REG_TAB.REWARDS_ADDRESS_INPUT_MULTI)}
      >
        {dictionary('buttonDifferent.text')}
      </Button>
    </div>
  );
}
