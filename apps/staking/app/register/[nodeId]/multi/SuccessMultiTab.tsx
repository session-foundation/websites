import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { StakedContractCard } from '@/components/StakedNode/StakedContractCard';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Loading } from '@session/ui/components/loading';
import { PartyPopperIcon } from '@session/ui/icons/PartyPopperIcon';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { getContributionContractBySnKey } from '@/lib/queries/getContributionContractBySnKey';
import { getNonFinalizedDeployedContributorContractAddress } from '@/app/register/[nodeId]/multi/SubmitMultiTab';
import {
  CONTRIBUTION_CONTRACT_STATUS,
  type ContributorContractInfo,
  type StakeContributor,
} from '@session/staking-api-js/client';
import { TOKEN } from '@session/contracts';

export function SuccessMultiTab() {
  const dictionary = useTranslations('actionModules.registration.successMulti');
  const dictionaryShared = useTranslations('actionModules.registration.shared');
  const { contract, props, formMulti, address } = useRegistrationWizard();

  const { data } = useStakingBackendQueryWithParams(
    getContributionContractBySnKey,
    {
      nodePubKey: props.ed25519PubKey,
    },
    {
      refetchInterval: (query) =>
        getNonFinalizedDeployedContributorContractAddress(query.state.data) ? false : 5000,
      gcTime: Number.POSITIVE_INFINITY,
      staleTime: Number.POSITIVE_INFINITY,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const amount = formMulti.watch('stakeAmount');
  const beneficiary = formMulti.watch('rewardsAddress');

  const deployedContract = useMemo(() => {
    let contractDetails: ContributorContractInfo | null = null;
    if (contract) {
      contractDetails = { ...contract };
    } else if (data && 'contract' in data && data.contract) {
      contractDetails = { ...data.contract };
    }

    if (!contractDetails) return null;

    /**
     * To get a success state the contract has been contributed to by the operator. If the status
     * is `WaitForOperatorContrib` here that just means the contract details havent been
     * witnessed by the backend yet. We can do an optimistic update here to set the status to
     * `OpenForPublicContrib` and set the `contributed` array to the current address and stake
     * amount.
     */
    if (contractDetails.status === CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib) {
      contractDetails.status = CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib;
      contractDetails.contributors = [
        {
          address: address!,
          amount: parseInt(amount) * Math.pow(10, TOKEN.DECIMALS),
          beneficiary,
          reserved: 0,
        },
      ] satisfies Array<StakeContributor>;
    }

    return contractDetails;
  }, [contract, data, address, beneficiary, amount]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <PartyPopperIcon className="h-40 w-40" />
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dictionary('specialTitle')} />
        <WizardSectionDescription description={dictionary('specialDescription')} />
      </div>
      {deployedContract ? (
        <StakedContractCard
          className="text-start"
          id={deployedContract.address}
          contract={deployedContract}
          hideButton
        />
      ) : (
        // TODO: replace loading indicator with skeleton -- the user should never see the loading state, but its here just in case
        <Loading />
      )}
      <Link href="/mystakes" className="w-full">
        <Button
          aria-label={dictionaryShared('buttonViewMyStakes.aria')}
          data-testid={ButtonDataTestId.Registration_Success_Multi_View_My_Stakes}
          rounded="md"
          className="w-full"
        >
          {dictionaryShared('buttonViewMyStakes.text')}
        </Button>
      </Link>
    </div>
  );
}
