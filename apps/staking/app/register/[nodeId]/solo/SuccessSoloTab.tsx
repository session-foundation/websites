import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { StakedNodeCard } from '@/components/StakedNodeCard';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { useStakes } from '@/hooks/useStakes';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { useNodesWithConfirmations } from '@/lib/volatile-storage';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { Stake } from '@session/staking-api-js/schema';
import { Loading } from '@session/ui/components/loading';
import { PartyPopperIcon } from '@session/ui/icons/PartyPopperIcon';
import { Button } from '@session/ui/ui/button';
import { areHexesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

export function SuccessSoloTab() {
  const { props } = useRegistrationWizard();
  const currentActor = useCurrentActor();

  const dict = useTranslations('actionModules.registration.successSolo');
  const dictShared = useTranslations('actionModules.registration.shared');
  const {
    nodes: { nodesConfirmingRegistration },
  } = useNodesWithConfirmations();

  const { stakes, blockHeight, networkTime, refetch } = useStakes();
  const stake = stakes.find((stake) =>
    areHexesEqual(stake.service_node_pubkey, props.ed25519PubKey)
  );

  const confirmingNode = useMemo(
    () =>
      nodesConfirmingRegistration.find(
        (m) =>
          m.pubkeyEd25519 === props.ed25519PubKey && areHexesEqual(m.operatorAddress, currentActor)
      ),
    [props.ed25519PubKey, nodesConfirmingRegistration, currentActor]
  );

  const optimisticStake = useMemo(() => {
    if (stake) return stake;
    if (confirmingNode)
      return {
        contributors: [
          {
            addr: currentActor,
            amount: SESSION_NODE_FULL_STAKE_AMOUNT,
          },
        ],
        operator_address: currentActor,
        pubkey_bls: props.blsKey,
        pubkey_ed25519: props.ed25519PubKey,
        service_node_pubkey: props.ed25519PubKey,
        stake_amount: SESSION_NODE_FULL_STAKE_AMOUNT,
        staking_requirement: SESSION_NODE_FULL_STAKE_AMOUNT,
        events: [],
        total_contributed: SESSION_NODE_FULL_STAKE_AMOUNT,
        active: false,
      } as unknown as Stake;
  }, [stake, confirmingNode, currentActor, props.blsKey, props.ed25519PubKey]);

  useEffect(() => {
    if (!stake) void refetch();
  }, [stake, refetch]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <PartyPopperIcon className="h-40 w-40" />
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dict('specialTitle')} />
        <WizardSectionDescription description={dict('specialDescription')} />
      </div>
      {optimisticStake ? (
        <StakedNodeCard
          className="text-start"
          id={optimisticStake.contract_id.toString()}
          stake={optimisticStake}
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
