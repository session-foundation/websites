import { ErrorTab } from '@/app/register/[nodeId]/shared/ErrorTab';
import { ManageStakeContribution } from '@/app/stake/[address]/ManageStakeContribution';
import { OperatorRemoveStake } from '@/app/stake/[address]/OperatorRemoveStake';
import { StakeInfo, type StakeInfoProps } from '@/app/stake/[address]/StakeInfo';
import type { ErrorBoxProps } from '@/components/Error/ErrorBox';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { useVesting } from '@/providers/vesting-provider';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { areHexesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { useCallback, useMemo, useRef, useState } from 'react';

enum EditableStakeGroup {
  Contribution = 'contribution',
  AutoActivate = 'autoActivate',
  OperatorFee = 'operatorFee',
}

export function ManageStake({
  contract,
  refetch,
}: { contract: ContributionContract; refetch: () => void }) {
  const [editableStakeGroup, setEditableStakeGroup] = useState<EditableStakeGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const address = useCurrentActor();
  const { isLoading } = useVesting();

  const dictionary = useTranslations('actionModules.staking');

  const isOperator = areHexesEqual(contract.operator_address, address);
  const isFinalized = contract.status === CONTRIBUTION_CONTRACT_STATUS.Finalized;

  const haveOtherContributorsContributed = contract.contributors.length > 1;

  const containerRef = useRef<HTMLDivElement>(null);
  const stakeAmountRef = useRef<HTMLInputElement>(null);
  const rewardsAddressRef = useRef<HTMLInputElement>(null);

  const editField = useCallback((field: EditableStakeGroup, postScrollCallback?: () => void) => {
    setEditableStakeGroup(field);
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ block: 'end', inline: 'end', behavior: 'smooth' });
      postScrollCallback?.();
    }, 25);
  }, []);

  const editableFields = useMemo(() => {
    const fields: StakeInfoProps['editableFields'] = {};

    fields.stakeAmount = !isFinalized
      ? {
          editOnClick: () =>
            editField(EditableStakeGroup.Contribution, () => stakeAmountRef.current?.focus()),
        }
      : {
          disabled: true,
          disabledTooltipContent: dictionary('disabledReason.alreadyFinalized'),
        };

    fields.rewardsAddress = !isFinalized
      ? {
          editOnClick: () =>
            editField(EditableStakeGroup.Contribution, () => rewardsAddressRef.current?.focus()),
        }
      : {
          disabled: true,
          disabledTooltipContent: dictionary('disabledReason.alreadyFinalized'),
        };

    if (isOperator) {
      fields.operatorFee = !haveOtherContributorsContributed
        ? {
            editOnClick: () => editField(EditableStakeGroup.OperatorFee),
          }
        : {
            disabled: true,
            disabledTooltipContent: dictionary('disabledReason.alreadyContributedOperatorFee'),
          };

      fields.autoActivate = !isFinalized
        ? {
            editOnClick: () => editField(EditableStakeGroup.AutoActivate),
          }
        : {
            disabled: true,
            disabledTooltipContent: dictionary('disabledReason.alreadyFinalized'),
          };
    }

    return fields;
  }, [isFinalized, haveOtherContributorsContributed, isOperator, dictionary, editField]);

  return (
    <StakeInfo
      contract={contract}
      isSubmitting={isSubmitting}
      editableFields={editableFields}
      ref={containerRef}
    >
      <ErrorBoundary errorComponent={ErrorStake}>
        {/** There is a race condition if we don't make sure vesting contracts have loaded
         before mounting the component */}
        {editableStakeGroup === EditableStakeGroup.Contribution && !isLoading ? (
          <ManageStakeContribution
            contract={contract}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            refetch={refetch}
            stakeAmountRef={stakeAmountRef}
            rewardsAddressRef={rewardsAddressRef}
          />
        ) : null}
        {!isLoading && isOperator ? (
          <OperatorRemoveStake
            contract={contract}
            setIsSubmitting={setIsSubmitting}
            refetch={refetch}
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
