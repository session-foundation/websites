import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { StakedNodeCard } from '@/components/StakedNodeCard';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { useStakes } from '@/hooks/useStakes';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Loading } from '@session/ui/components/loading';
import { Button } from '@session/ui/ui/button';
import { areHexesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';

export function AlreadyRegisteredRunningTab() {
  const { props } = useRegistrationWizard();

  const dict = useTranslations('actionModules.registration.alreadyRegisteredMulti');
  const dictShared = useTranslations('actionModules.registration.shared');

  const { stakes, blockHeight, networkTime, refetch } = useStakes();

  const stake = stakes.find((stake) =>
    areHexesEqual(stake.service_node_pubkey, props.ed25519PubKey)
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: On mount
  useEffect(() => {
    if (!stake) void refetch();
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dict('specialTitle')} />
        <WizardSectionDescription description={dict('specialDescription')} />
      </div>
      {stake ? (
        <StakedNodeCard
          className="text-start"
          id={stake.contract_id.toString()}
          stake={stake}
          blockHeight={blockHeight ?? 0}
          networkTime={networkTime ?? Date.now()}
          hideButton
        />
      ) : (
        // TODO: replace loading indicator with skeleton
        <Loading />
      )}
      <Link href="/mystakes" className="w-full">
        <Button
          aria-label={dictShared('buttonViewMyStakes.aria')}
          data-testid={ButtonDataTestId.Registration_Success_Solo_View_My_Stakes}
          rounded="md"
          className="w-full"
        >
          {dictShared('buttonViewMyStakes.text')}
        </Button>
      </Link>
    </div>
  );
}
