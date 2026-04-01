import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import {
  StakedContractCard,
  getStakedContractCardContractFromConfirmation,
} from '@/components/StakedNode/StakedContractCard';
import { StakedNodeCard } from '@/components/StakedNodeCard';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { useStakes } from '@/providers/user-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Loading } from '@session/ui/components/loading';
import { Button } from '@session/ui/ui/button';
import { areBLSKeysEqual, areEd25519KeysEqual } from '@session/util-crypto/string';
import { useMount } from '@session/util-react/hooks/useMount';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function AlreadyRegisteredRunningTab() {
  const { props } = useRegistrationWizard();

  const dict = useTranslations('actionModules.registration.alreadyRegisteredRunning');
  const dictShared = useTranslations('actionModules.registration.shared');

  const { stakes, joiningContracts, notFoundJoiningNodes, refetch } = useStakes();

  const joiningContract = joiningContracts.find(
    ({ service_node_pubkey, pubkey_bls }) =>
      areEd25519KeysEqual(service_node_pubkey, props.ed25519PubKey) ||
      areBLSKeysEqual(pubkey_bls, props.blsKey)
  );

  const joiningFromConfirmation = notFoundJoiningNodes.find(
    ({ pubkeyEd25519, pubkeyBls }) =>
      areEd25519KeysEqual(pubkeyEd25519, props.ed25519PubKey) ||
      areBLSKeysEqual(pubkeyBls, props.blsKey)
  );

  const stake = stakes.find(
    (stake) =>
      areEd25519KeysEqual(stake.service_node_pubkey, props.ed25519PubKey) ||
      areBLSKeysEqual(stake.pubkey_bls, props.blsKey)
  );

  useMount(() => {
    if (!stake) void refetch();
  });

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dict('specialTitle')} />
        <WizardSectionDescription description={dict('specialDescription')} />
      </div>
      {joiningContract ? (
        <StakedContractCard
          toggleId={joiningContract.service_node_pubkey}
          contract={joiningContract}
        />
      ) : joiningFromConfirmation ? (
        <StakedContractCard
          toggleId={joiningFromConfirmation.pubkeyEd25519}
          contract={getStakedContractCardContractFromConfirmation(joiningFromConfirmation)}
        />
      ) : stake ? (
        <StakedNodeCard
          className="text-start"
          toggleId={stake.contract_id.toString()}
          stake={stake}
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
