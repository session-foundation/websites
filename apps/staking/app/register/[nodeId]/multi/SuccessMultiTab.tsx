import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { getNonFinalizedLatestDeployedContributorContract } from '@/app/register/[nodeId]/multi/SubmitMultiTab';
import { StakedContractCard } from '@/components/StakedNode/StakedContractCard';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { BACKEND } from '@/lib/constants';
import { getContributionContractBySnKey } from '@/lib/queries/getContributionContractBySnKey';
import { useStakingBackendQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { TOKEN } from '@session/contracts';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type {
  ContributionContractContributor,
  ContributionContractNotReady,
} from '@session/staking-api-js/schema';
import { Loading } from '@session/ui/components/loading';
import { PartyPopperIcon } from '@session/ui/icons/PartyPopperIcon';
import { Button } from '@session/ui/ui/button';
import { numberToBigInt } from '@session/util-crypto/maths';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Address } from 'viem';

export function SuccessMultiTab() {
  const { contract, props, formMulti, address } = useRegistrationWizard();

  const dict = useTranslations('actionModules.registration.successMulti');
  const dictShared = useTranslations('actionModules.registration.shared');

  const { data } = useStakingBackendQueryWithParams(
    getContributionContractBySnKey,
    {
      nodePubKey: props.ed25519PubKey,
    },
    {
      refetchInterval: (query) =>
        getNonFinalizedLatestDeployedContributorContract(query.state.data)
          ? false
          : BACKEND.MULTI_REGISTRATION_SN_POLL_INTERVAL_MS,
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
    let contractDetails: ContributionContractNotReady | null = null;
    if (contract) {
      contractDetails = { ...contract };
    } else {
      const fetchedContract = getNonFinalizedLatestDeployedContributorContract(data);
      if (fetchedContract) {
        contractDetails = { ...fetchedContract };
      }
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
          address,
          amount: numberToBigInt(Number.parseInt(amount) * 10 ** TOKEN.DECIMALS),
          beneficiary_address: beneficiary as Address,
          reserved: 0n,
        },
      ] satisfies Array<ContributionContractContributor>;
    }

    return contractDetails;
  }, [contract, data, address, beneficiary, amount]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <PartyPopperIcon className="h-40 w-40" />
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dict('specialTitle')} />
        <WizardSectionDescription description={dict('specialDescription')} />
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
          aria-label={dictShared('buttonViewMyStakes.aria')}
          data-testid={ButtonDataTestId.Registration_Success_Multi_View_My_Stakes}
          rounded="md"
          className="w-full"
        >
          {dictShared('buttonViewMyStakes.text')}
        </Button>
      </Link>
    </div>
  );
}
