import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { StakedContractCard } from '@/components/StakedNode/StakedContractCard';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Loading } from '@session/ui/components/loading';
import { PartyPopperIcon } from '@session/ui/icons/PartyPopperIcon';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

export function SuccessMultiTab() {
  const dictionary = useTranslations('actionModules.registration.successMulti');
  const { contract } = useRegistrationWizard();

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <PartyPopperIcon className="h-40 w-40" />
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dictionary('specialTitle')} />
        <WizardSectionDescription description={dictionary('specialDescription')} />
      </div>
      {contract ? (
        <StakedContractCard
          className="text-start"
          id={contract.address}
          contract={contract}
          hideButton
        />
      ) : (
        // TODO: replace loading indicator with skeleton
        <Loading />
      )}
      <Link href="/mystakes" className="w-full">
        <Button
          aria-label={dictionary('buttonViewMyStakes.aria')}
          data-testid={ButtonDataTestId.Registration_Success_Multi_View_My_Stakes}
          rounded="md"
          className="w-full"
        >
          {dictionary('buttonViewMyStakes.text')}
        </Button>
      </Link>
    </div>
  );
}
