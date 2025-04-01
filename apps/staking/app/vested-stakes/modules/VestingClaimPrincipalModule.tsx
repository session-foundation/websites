'use client';

import ModuleButtonDialogTrigger from '@/components/ModuleButtonDialogTrigger';
import { VestingClaimPrincipal } from '@/components/Vesting/VestingClaimPrincipal';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { useTranslations } from 'next-intl';

export default function VestingClaimPrincipalModule() {
  const dict = useTranslations('vesting.modules.claimPrincipal');
  const activeContract = useActiveVestingContract();

  return (
    <ModuleButtonDialogTrigger
      dialogContent={<VestingClaimPrincipal />}
      disabled={!activeContract}
      textClassName="text-lg md:text-2xl"
      dialogTitle={dict('title')}
      label={dict('title')}
      data-testid={ButtonDataTestId.Vesting_Claim_Principal_Open_Dialog}
    />
  );
}
