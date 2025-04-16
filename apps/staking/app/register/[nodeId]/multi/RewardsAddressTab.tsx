import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';

export function RewardsAddressTab() {
  const { changeTab } = useRegistrationWizard();
  const dict = useTranslations('actionModules.registration.rewardsAddress');

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        data-testid={ButtonDataTestId.Registration_Rewards_Address_Same}
        aria-label={dict('buttonSame.aria')}
        onClick={() => changeTab(REG_TAB.RESERVE_SLOTS)}
      >
        {dict('buttonSame.text')}
      </Button>
      <Button
        data-testid={ButtonDataTestId.Registration_Rewards_Address_Different}
        aria-label={dict('buttonDifferent.aria')}
        onClick={() => changeTab(REG_TAB.REWARDS_ADDRESS_INPUT_MULTI)}
      >
        {dict('buttonDifferent.text')}
      </Button>
    </div>
  );
}
