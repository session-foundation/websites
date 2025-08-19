import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { StakedNodeCard } from '@/components/StakedNodeCard';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { useNodesWithConfirmations } from '@/lib/volatile-storage';
import { useStakes, useUser } from '@/providers/user-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { Stake } from '@session/staking-api-js/schema';
import { Loading } from '@session/ui/components/loading';
import { PartyPopperIcon } from '@session/ui/icons/PartyPopperIcon';
import { Button } from '@session/ui/ui/button';
import {
  areBLSKeysEqual,
  areEd25519KeysEqual,
  areEthereumAddressesEqual,
} from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

export function SuccessSoloTab() {
  const { props } = useRegistrationWizard();
  const { activeAddress } = useUser();

  const dict = useTranslations('actionModules.registration.successSolo');
  const dictShared = useTranslations('actionModules.registration.shared');
  const {
    nodes: { nodesConfirmingRegistration },
  } = useNodesWithConfirmations();

  const { stakes, refetch } = useStakes();
  const stake = stakes.find(
    (stake) =>
      areEd25519KeysEqual(stake.service_node_pubkey, props.ed25519PubKey) ||
      areBLSKeysEqual(stake.pubkey_bls, props.blsKey)
  );

  const confirmingNode = useMemo(
    () =>
      nodesConfirmingRegistration.find(
        (m) =>
          m.pubkeyEd25519 === props.ed25519PubKey &&
          areEthereumAddressesEqual(m.operatorAddress, activeAddress)
      ),
    [props.ed25519PubKey, nodesConfirmingRegistration, activeAddress]
  );

  const optimisticStake = useMemo(() => {
    if (stake) return stake;
    if (confirmingNode)
      return {
        contributors: [
          {
            addr: activeAddress,
            amount: SESSION_NODE_FULL_STAKE_AMOUNT,
          },
        ],
        operator_address: activeAddress,
        pubkey_bls: props.blsKey,
        pubkey_ed25519: props.ed25519PubKey,
        service_node_pubkey: props.ed25519PubKey,
        stake_amount: SESSION_NODE_FULL_STAKE_AMOUNT,
        staking_requirement: SESSION_NODE_FULL_STAKE_AMOUNT,
        events: [],
        total_contributed: SESSION_NODE_FULL_STAKE_AMOUNT,
        active: false,
      } as unknown as Stake;
  }, [stake, confirmingNode, activeAddress, props.blsKey, props.ed25519PubKey]);

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
          toggleId={optimisticStake.pubkey_ed25519}
          stake={optimisticStake}
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
