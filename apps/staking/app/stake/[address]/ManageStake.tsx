import { ErrorTab } from '@/app/register/[nodeId]/shared/ErrorTab';
import { ManageStakeContribution } from '@/app/stake/[address]/ManageStakeContribution';
import { StakeInfo, type StakeInfoProps } from '@/app/stake/[address]/StakeInfo';
import type { ErrorBoxProps } from '@/components/Error/ErrorBox';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { useVesting } from '@/providers/vesting-provider';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { areHexesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useMemo, useState } from 'react';

enum EditableStakeGroup {
  Contribution = 'contribution',
  AutoActivate = 'autoActivate',
  OperatorFee = 'operatorFee',
}

export function ManageStake({ contract }: { contract: ContributionContract }) {
  const [editableStakeGroup, setEditableStakeGroup] = useState<EditableStakeGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const address = useCurrentActor();
  const { isLoading } = useVesting();

  const dictionary = useTranslations('actionModules.staking');

  const isOperator = areHexesEqual(contract.operator_address, address);
  const isFinalized = contract.status === CONTRIBUTION_CONTRACT_STATUS.Finalized;

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
  }, [isFinalized, haveOtherContributorsContributed, isOperator, dictionary]);

  return (
    <StakeInfo contract={contract} isSubmitting={isSubmitting} editableFields={editableFields}>
      <ErrorBoundary errorComponent={ErrorStake}>
        {/** There is a race condition if we don't make sure vesting contracts have loaded
         before mounting the component */}
        {editableStakeGroup === EditableStakeGroup.Contribution && !isLoading ? (
          <ManageStakeContribution
            contract={contract}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
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
