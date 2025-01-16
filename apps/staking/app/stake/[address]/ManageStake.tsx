import { type ErrorBoxProps, ErrorTab } from '@/app/register/[nodeId]/shared/ErrorTab';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useMemo, useState } from 'react';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { areHexesEqual } from '@session/util-crypto/string';
import {
  CONTRIBUTION_CONTRACT_STATUS,
  type ContributorContractInfo,
} from '@session/staking-api-js/client';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { StakeInfo, type StakeInfoProps } from '@/app/stake/[address]/StakeInfo';
import { ManageStakeContribution } from '@/app/stake/[address]/ManageStakeContribution';

enum EditableStakeGroup {
  Contribution = 'contribution',
  AutoActivate = 'autoActivate',
  OperatorFee = 'operatorFee',
}

export function ManageStake({ contract }: { contract: ContributorContractInfo }) {
  const [editableStakeGroup, setEditableStakeGroup] = useState<EditableStakeGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const { address } = useWallet();

  const dictionary = useTranslations('actionModules.staking');

  const isOperator = areHexesEqual(contract.operator_address, address);
  const isFinalized = contract.status === CONTRIBUTION_CONTRACT_STATUS.Finalized;

  const { totalStaked } = getContributionRangeFromContributors(contract.contributors);

  const haveOtherContributorsContributed = contract.contributors.length > 1;

  const editableFields = useMemo(() => {
    const fields: StakeInfoProps['editableFields'] = {};

    fields.stakeAmount = !isFinalized
      ? {
          editOnClick: () => setEditableStakeGroup(EditableStakeGroup.Contribution),
        }
      : {
          disabled: true,
          disabledTooltipContent: dictionary('disabledReason.alreadyFinalized'),
        };

    fields.rewardsAddress = !isFinalized
      ? {
          editOnClick: () => setEditableStakeGroup(EditableStakeGroup.Contribution),
        }
      : {
          disabled: true,
          disabledTooltipContent: dictionary('disabledReason.alreadyFinalized'),
        };

    if (isOperator) {
      fields.operatorFee = !haveOtherContributorsContributed
        ? {
            editOnClick: () => setEditableStakeGroup(EditableStakeGroup.OperatorFee),
          }
        : {
            disabled: true,
            disabledTooltipContent: dictionary('disabledReason.alreadyContributedOperatorFee'),
          };

      fields.autoActivate = !isFinalized
        ? {
            editOnClick: () => setEditableStakeGroup(EditableStakeGroup.AutoActivate),
          }
        : {
            disabled: true,
            disabledTooltipContent: dictionary('disabledReason.alreadyFinalized'),
          };
    }

    return fields;
  }, [isFinalized, haveOtherContributorsContributed, isOperator]);

  return (
    <StakeInfo
      contract={contract}
      totalStaked={totalStaked}
      isSubmitting={isSubmitting}
      editableFields={editableFields}
    >
      <ErrorBoundary errorComponent={ErrorStake}>
        {editableStakeGroup === EditableStakeGroup.Contribution ? (
          <ManageStakeContribution
            contract={contract}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            setIsError={setIsError}
          />
        ) : null}
      </ErrorBoundary>
    </StakeInfo>
  );
}

function ErrorStake({ error }: ErrorBoxProps) {
  const dict = useTranslations('actionModules.staking.error');
  return <ErrorTab error={error} dict={dict} />;
}