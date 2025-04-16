import { ActionModuleRow } from '@/components/ActionModule';
import { NodeContributorList } from '@/components/NodeCard';
import { ReservedStakesTable } from '@/components/ReservedStakesTable';
import type { ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { formatPercentage } from '@/lib/locale-client';
import { getContributionRangeFromContributorsIgnoreAddress, getTotalStaked } from '@/lib/maths';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { TOKEN } from '@session/contracts';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type { ContributionContract } from '@session/staking-api-js/schema';
import { EditButton } from '@session/ui/components/EditButton';
import { PubKey } from '@session/ui/components/PubKey';
import { Tooltip } from '@session/ui/ui/tooltip';
import { bigIntMax } from '@session/util-crypto/maths';
import { areHexesEqual } from '@session/util-crypto/string';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { type Address, isAddress } from 'viem';

export function getReservedSlots(contract: ContributionContract): Array<ReservedContributorStruct> {
  return contract.contributors
    .filter(({ address, reserved }) => reserved && isAddress(address))
    .map(({ address, reserved }) => {
      return {
        addr: address,
        amount: reserved,
      };
    })
    .sort((a, b) => {
      const isAOperator = areHexesEqual(a.addr, contract.operator_address);
      const isBOperator = areHexesEqual(b.addr, contract.operator_address);
      return isAOperator ? -1 : isBOperator ? 1 : 0;
    });
}

export function getContributedContributor(contract: ContributionContract, address?: Address) {
  if (!address) return undefined;
  return contract.contributors.find(
    ({ address: contributorAddress, amount }) =>
      areHexesEqual(contributorAddress, address) && amount > 0n
  );
}

export function getReservedContributor(contract: ContributionContract, address?: Address) {
  if (!address) return undefined;
  return contract.contributors.find(
    ({ address: contributorAddress, reserved }) =>
      areHexesEqual(contributorAddress, address) && reserved > 0n
  );
}

export function getReservedContributorNonContributed(
  contract: ContributionContract,
  address?: Address
) {
  if (!address) return undefined;
  return contract.contributors.find(
    ({ address: contributorAddress, reserved, amount }) =>
      areHexesEqual(contributorAddress, address) && reserved > 0n && amount === 0n
  );
}

export const getContributionRangeForWallet = (
  contract: ContributionContract,
  address?: Address
) => {
  const reservedContributor = getReservedContributor(contract, address);

  const { minStake: minStakeCalculated, maxStake } =
    getContributionRangeFromContributorsIgnoreAddress(contract.contributors, address);

  const minStake = bigIntMax(reservedContributor?.reserved, minStakeCalculated);

  return {
    minStake,
    maxStake,
  };
};

type EditableField = 'stakeAmount' | 'rewardsAddress' | 'operatorFee' | 'autoActivate';

type FieldProps = {
  editOnClick?: () => void;
  disabled?: boolean;
  disabledTooltipContent?: string;
};

export type StakeInfoProps = {
  contract: ContributionContract;
  totalStaked?: bigint;
  isSubmitting: boolean;
  editableFields?: Partial<Record<EditableField, FieldProps>>;
  children?: ReactNode;
};

export function StakeInfo({
  contract,
  totalStaked,
  editableFields,
  isSubmitting,
  children,
}: StakeInfoProps) {
  const address = useCurrentActor();

  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictShared = useTranslations('actionModules.shared');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');
  const actionModuleDictionary = useTranslations('actionModules');
  const dictGeneral = useTranslations('general');

  const isOperator = areHexesEqual(contract.operator_address, address);
  const contributor = contract.contributors.find(
    ({ address: contributorAddress, amount }) =>
      areHexesEqual(contributorAddress, address) && amount > 0n
  );
  const haveOtherContributorsContributed = contract.contributors.length > 1;
  const isFinalized = contract.status === CONTRIBUTION_CONTRACT_STATUS.Finalized;

  const reservedContributors = getReservedSlots(contract);
  const hasReservedContributors = reservedContributors.length > 1;

  return (
    <div className="flex w-full flex-col gap-3.5">
      <ActionModuleRow
        label={actionModuleDictionary('node.contributors')}
        tooltip={actionModuleDictionary('node.contributorsTooltip')}
      >
        <span className="flex flex-row flex-wrap items-center gap-2 align-middle">
          <NodeContributorList contributors={contract.contributors} forceExpand showEmptySlots />
        </span>
      </ActionModuleRow>
      {contributor ? (
        <ActionModuleRow
          label={dictShared('yourStake')}
          tooltip={dictShared('yourStakeDescription')}
        >
          {formatSENTBigInt(contributor.amount)}
          <EditButton
            aria-label={dictShared('buttonEditField.aria', { field: dictShared('yourStake') })}
            data-testid={ButtonDataTestId.Stake_Edit_Stake_Amount}
            disabled={
              isSubmitting ||
              isFinalized ||
              editableFields?.stakeAmount?.disabled ||
              !editableFields?.stakeAmount?.editOnClick
            }
            onClick={editableFields?.stakeAmount?.editOnClick}
          />
        </ActionModuleRow>
      ) : null}
      <ActionModuleRow
        label={dictShared('totalStaked')}
        tooltip={dictShared('totalStakedDescription')}
      >
        {`${formatSENTBigInt(totalStaked ?? getTotalStaked(contract.contributors), TOKEN.DECIMALS, true)} / ${formatSENTBigInt(SESSION_NODE_FULL_STAKE_AMOUNT)}`}
      </ActionModuleRow>
      <ActionModuleRow
        label={sessionNodeDictionary('publicKeyShort')}
        tooltip={sessionNodeDictionary('publicKeyDescription')}
      >
        <PubKey
          pubKey={contract.service_node_pubkey}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={sessionNodeDictionary('blsKey')}
        tooltip={sessionNodeDictionary('blsKeyDescription')}
      >
        <PubKey
          pubKey={contract.pubkey_bls ?? dictGeneral('notFound')}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('autoActivate')}
        tooltip={dictShared('autoActivateDescription')}
      >
        <span className="font-semibold">
          {dictShared(!contract.manual_finalize ? 'enabled' : 'disabled')}
        </span>
        {isOperator ? (
          <Tooltip tooltipContent="Editing this field is not yet supported">
            <EditButton
              aria-label={dictShared('buttonEditField.aria', { field: dictShared('autoActivate') })}
              data-testid={ButtonDataTestId.Stake_Edit_Auto_Activate}
              disabled={
                // TODO: Implement auto activation field changing
                true ||
                isSubmitting ||
                isFinalized ||
                editableFields?.autoActivate?.disabled ||
                !editableFields?.autoActivate?.editOnClick
              }
              onClick={editableFields?.autoActivate?.editOnClick}
            />
          </Tooltip>
        ) : null}
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('operatorAddress')}
        tooltip={dictShared('operatorAddressDescription')}
      >
        <PubKey
          pubKey={contract.operator_address}
          force="collapse"
          alwaysShowCopyButton
          leadingChars={8}
          trailingChars={4}
          className="font-semibold"
        />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictShared('operatorFee')}
        tooltip={dictShared('operatorFeeDescription')}
      >
        <span className="font-semibold">
          {contract.fee !== null ? formatPercentage(contract.fee / 10000) : dictGeneral('notFound')}
        </span>
        {isOperator ? (
          <Tooltip tooltipContent="Editing this field is not yet supported">
            <EditButton
              disabled={
                // TODO: Implement operator fee field changing
                true ||
                haveOtherContributorsContributed ||
                isSubmitting ||
                isFinalized ||
                editableFields?.operatorFee?.disabled ||
                !editableFields?.operatorFee?.editOnClick
              }
              onClick={editableFields?.operatorFee?.editOnClick}
              aria-label={dictShared('buttonEditField.aria', { field: dictShared('operatorFee') })}
              data-testid={ButtonDataTestId.Stake_Edit_Operator_Fee}
            />
          </Tooltip>
        ) : null}
      </ActionModuleRow>
      {contributor ? (
        <ActionModuleRow
          label={dictShared('rewardsAddress')}
          tooltip={dictShared('rewardsAddressDescription')}
        >
          <PubKey
            pubKey={contributor.beneficiary_address ?? contributor.address ?? dictGeneral('none')}
            force="collapse"
            alwaysShowCopyButton
            leadingChars={8}
            trailingChars={4}
            className="font-semibold"
          />
          <EditButton
            disabled={
              isSubmitting ||
              isFinalized ||
              editableFields?.rewardsAddress?.disabled ||
              !editableFields?.rewardsAddress?.editOnClick
            }
            onClick={editableFields?.rewardsAddress?.editOnClick}
            aria-label={dictionaryRegistrationShared('buttonEditField.aria')}
            data-testid={ButtonDataTestId.Stake_Edit_Rewards_Address}
          />
        </ActionModuleRow>
      ) : null}
      <ActionModuleRow
        label={dictShared('reserveSlots')}
        tooltip={dictShared('reserveSlotsDescription')}
        parentClassName={
          hasReservedContributors ? 'flex flex-col gap-2 justify-start items-start w-full' : ''
        }
        containerClassName={hasReservedContributors ? 'w-full' : ''}
        last={hasReservedContributors}
      >
        {/* reservedContributors length 1 means only the operator, so we treat it as no reserved slots*/}
        {hasReservedContributors ? (
          <ReservedStakesTable reservedStakes={reservedContributors} className="my-2 w-full" />
        ) : (
          <span className="font-semibold">{dictGeneral('none')}</span>
        )}
      </ActionModuleRow>
      {children}
    </div>
  );
}
