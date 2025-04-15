import { useTotalStaked } from '@/app/mystakes/modules/useTotalStaked';
import { useVestingEndTime } from '@/app/vested-stakes/modules/VestingEndTimeModule';
import { useVestingUnstakedBalance } from '@/app/vested-stakes/modules/VestingUnstakedBalanceModule';
import { ActionModuleRow } from '@/components/ActionModule';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import { useUnclaimedTokens } from '@/hooks/useUnclaimedTokens';
import { DYNAMIC_MODULE, PREFERENCE } from '@/lib/constants';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { EditButton } from '@session/ui/components/EditButton';
import { PubKey } from '@session/ui/components/PubKey';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';
import { usePreferences } from 'usepref';

export function useVestingInitialBalance() {
  const vestingContract = useActiveVestingContract();
  const balance = vestingContract?.initial_amount ?? 0n;
  const formattedBalance = formatSENTBigInt(balance);
  return { balance, formattedBalance };
}

export type VestingInfoProps = {
  editBeneficiaryButtonCallback?: () => void;
  hideTimeToUnlock?: boolean;
  hideUnstakedBalance?: boolean;
};

export function VestingInfo({
  editBeneficiaryButtonCallback,
  hideTimeToUnlock,
  hideUnstakedBalance,
}: VestingInfoProps) {
  const dict = useTranslations('vesting.infoDialog');
  const dictModules = useTranslations('vesting.modules');
  const vestingContract = useActiveVestingContract();
  const { formattedBalance: formattedInitialBalance } = useVestingInitialBalance();
  const { formattedDate, relativeTime, isEnded } = useVestingEndTime();

  const address = vestingContract?.address;

  const { totalStakedFormatted } = useTotalStaked(vestingContract?.address);
  const { formattedAmount: vestingUnstakedBalance } = useVestingUnstakedBalance();
  const { unclaimed: unclaimedV2 } = useNetworkBalances({ addressOverride: address });
  const formattedUnclaimedRewardsAmountV2 = formatSENTBigInt(
    unclaimedV2,
    DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS
  );

  // TODO: remove this v1 logic once v2 is stable
  const { getItem } = usePreferences();
  const v2Rewards = !!getItem<boolean>(PREFERENCE.V2_Rewards);
  const { formattedUnclaimedRewardsAmount: formattedUnclaimedRewardsAmountV1 } = useUnclaimedTokens(
    { addressOverride: address }
  );
  const formattedUnclaimedRewardsAmount = v2Rewards
    ? formattedUnclaimedRewardsAmountV2
    : formattedUnclaimedRewardsAmountV1;

  return (
    <>
      {vestingContract ? (
        <div className="mb-2 flex w-full flex-col gap-4">
          <ActionModuleRow label={dict('address')} tooltip={dict('addressDescription')}>
            <PubKey
              pubKey={vestingContract.address}
              force="collapse"
              leadingChars={10}
              trailingChars={10}
              alwaysShowCopyButton
            />
          </ActionModuleRow>
          <ActionModuleRow label={dict('beneficiary')} tooltip={dict('beneficiaryDescription')}>
            <PubKey
              pubKey={vestingContract.beneficiary}
              force="collapse"
              leadingChars={8}
              trailingChars={8}
              alwaysShowCopyButton
            />
            {vestingContract.transferable_beneficiary && editBeneficiaryButtonCallback ? (
              <EditButton
                data-testid={ButtonDataTestId.Vesting_Info_Edit_Beneficiary}
                onClick={editBeneficiaryButtonCallback}
              />
            ) : (
              <Tooltip tooltipContent={dict('editBeneficiaryDisabledDescription')}>
                <div className="-mb-1 -ms-0.5 cursor-pointer">
                  <EditButton
                    data-testid={ButtonDataTestId.Vesting_Info_Edit_Beneficiary}
                    disabled
                  />
                </div>
              </Tooltip>
            )}
          </ActionModuleRow>
          <ActionModuleRow
            label={dict('initialBalance')}
            tooltip={dict('initialBalanceDescription')}
          >
            {formattedInitialBalance}
          </ActionModuleRow>
          <ActionModuleRow
            label={dictModules('stakedBalance.title')}
            tooltip={dictModules('stakedBalance.description')}
          >
            {totalStakedFormatted}
          </ActionModuleRow>
          {!hideUnstakedBalance ? (
            <ActionModuleRow
              label={dictModules(isEnded ? 'withdrawableBalance.title' : 'unstakedBalance.title')}
              tooltip={dictModules(
                isEnded ? 'withdrawableBalance.description' : 'unstakedBalance.description'
              )}
            >
              {vestingUnstakedBalance}
            </ActionModuleRow>
          ) : null}
          <ActionModuleRow
            label={dictModules('unclaimedStakes.title')}
            tooltip={dictModules('unclaimedStakes.description')}
          >
            {formattedUnclaimedRewardsAmount}
          </ActionModuleRow>
          {!hideTimeToUnlock ? (
            <ActionModuleRow
              label={dictModules('endTime.title')}
              tooltip={dictModules('endTime.description', {
                date: formattedDate,
              })}
            >
              <Tooltip tooltipContent={formattedDate}>
                <div className="cursor-pointer">
                  {isEnded ? dict('endTimeEnded') : relativeTime}
                </div>
              </Tooltip>
            </ActionModuleRow>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
