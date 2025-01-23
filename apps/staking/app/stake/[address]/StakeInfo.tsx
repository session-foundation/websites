import { ActionModuleRow } from '@/components/ActionModule';
import { formatPercentage } from '@/lib/locale-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { TOKEN } from '@session/contracts';
import { PubKey } from '@session/ui/components/PubKey';
import { useTranslations } from 'next-intl';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { EditButton } from '@session/ui/components/EditButton';
import { areHexesEqual } from '@session/util-crypto/string';
import {
  CONTRIBUTION_CONTRACT_STATUS,
  type ContributorContractInfo,
} from '@session/staking-api-js/client';
import { NodeContributorList } from '@/components/NodeCard';
import { formatSENTBigInt, formatSENTNumber } from '@session/contracts/hooks/Token';
import type { ReactNode } from 'react';
import { Tooltip } from '@session/ui/ui/tooltip';
import { isAddress } from 'viem';

type EditableField = 'stakeAmount' | 'rewardsAddress' | 'operatorFee' | 'autoActivate';

type FieldProps = {
  editOnClick?: () => void;
  disabled?: boolean;
  disabledTooltipContent?: string;
};

export type StakeInfoProps = {
  contract: ContributorContractInfo;
  totalStaked: bigint;
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
  const { address } = useWallet();

  const dictionaryRegistrationShared = useTranslations('actionModules.registration.shared');
  const dictShared = useTranslations('actionModules.shared');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');
  const actionModuleDictionary = useTranslations('actionModules');
  const dictGeneral = useTranslations('general');

  const isOperator = areHexesEqual(contract.operator_address, address);
  const contributor = contract.contributors.find((contributor) =>
    areHexesEqual(contributor.address, address)
  );
  const haveOtherContributorsContributed = contract.contributors.length > 1;
  const isFinalized = contract.status === CONTRIBUTION_CONTRACT_STATUS.Finalized;

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
          {formatSENTNumber(contributor.amount)}
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
        {`${formatSENTBigInt(totalStaked, TOKEN.DECIMALS, true)} / ${formatSENTBigInt(SESSION_NODE_FULL_STAKE_AMOUNT)}`}
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
          pubKey={contract.pubkey_bls}
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
        <span className="font-semibold">{!contract.manual_finalize ? 'Enabled' : 'Disabled'}</span>
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
        <span className="font-semibold">{formatPercentage(contract.fee / 10000)}</span>
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
            pubKey={
              contributor.beneficiary && isAddress(contributor.beneficiary)
                ? contributor.beneficiary
                : address ?? dictGeneral('none')
            }
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
      {children}
    </div>
  );
}
