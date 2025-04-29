import { useTotalStaked } from '@/app/mystakes/modules/useTotalStaked';
import { useVestingUnstakedBalance } from '@/app/vested-stakes/modules/VestingUnstakedBalanceModule';
import ActionModuleFeeRow from '@/components/ActionModuleFeeRow';
import { VestingInfo } from '@/components/Vesting/VestingInfo';
import { useNetworkBalances } from '@/hooks/useNetworkBalances';
import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useConnectedVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { addresses, isValidChainId } from '@session/contracts';
import { useVestingRelease } from '@session/contracts/hooks/TokenVestingStaking';
import { toast } from '@session/ui/lib/toast';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { Button } from '@session/ui/ui/button';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { ActionModuleRow } from '../ActionModule';

export function VestingClaimPrincipal() {
  const dict = useTranslations('vesting.modules.claimPrincipal');
  const dictGeneral = useTranslations('general');
  const dictShared = useTranslations('actionModules.shared');

  const activeContract = useConnectedVestingContract();
  const { chainId } = useWallet();
  const tokenAddress = useMemo(
    () => (isValidChainId(chainId) ? addresses.Token[chainId] : undefined),
    [chainId]
  );

  const [claimedPrincipalAmount, setClaimedPrincipalAmount] = useState<string | null>(null);

  const address = activeContract.address;

  const { totalStaked } = useTotalStaked(address);
  const { unclaimed: unclaimedStakes } = useNetworkBalances({ addressOverride: address });

  const {
    formattedAmount: formattedClaimableBalance,
    amount: claimableBalance,
    refetch,
  } = useVestingUnstakedBalance();

  const nothingToClaim = claimableBalance === 0n;
  const notAllWithdrawable =
    claimableBalance < activeContract.initial_amount ||
    totalStaked > 0 ||
    (unclaimedStakes ?? 0) > 0;

  const {
    simulateAndWriteContract,
    contractCallStatus,
    simulateError,
    writeError,
    transactionError,
    fee,
    gasAmount,
    gasPrice,
    resetContract,
  } = useVestingRelease({
    vestingContractAddress: activeContract.address,
    tokenAddress: tokenAddress!,
  });

  const withdraw = () => {
    simulateAndWriteContract();
  };

  const retry = () => {
    resetContract();
    withdraw();
  };

  const isError = contractCallStatus === 'error';

  const errorMessage = useMemo(
    () =>
      formatAndHandleLocalizedContractErrorMessages({
        errorGroupDictKey: 'contractCall',
        dict,
        dictGeneral,
        simulateError,
        writeError,
        transactionError,
      }),
    [simulateError, writeError, transactionError, dict, dictGeneral]
  );

  const button = (
    <Button
      className={cn('w-full uppercase', contractCallStatus !== 'idle' ? 'hidden' : '')}
      data-testid={ButtonDataTestId.Vesting_Claim_Principal_Confirm}
      aria-label={dict('confirmButton.aria')}
      onClick={() => {
        setClaimedPrincipalAmount(formattedClaimableBalance);
        withdraw();
      }}
      disabled={
        nothingToClaim || contractCallStatus === 'pending' || contractCallStatus === 'success'
      }
    >
      {dict('confirmButton.label')}
    </Button>
  );

  useEffect(() => {
    if (contractCallStatus === 'success') {
      toast.success(dict('successToast', { amount: claimedPrincipalAmount }));
      void refetch();
    } else if (contractCallStatus === 'error') {
      toast.error(errorMessage);
    }
  }, [contractCallStatus, claimedPrincipalAmount, dict, refetch, errorMessage]);

  return (
    <>
      <VestingInfo hideUnstakedBalance hideTimeToUnlock />
      <ActionModuleRow
        label={dict('claimablePrincipal.title')}
        tooltip={dict('claimablePrincipal.description')}
        parentClassName="mb-2"
      >
        {formattedClaimableBalance}
      </ActionModuleRow>
      <ActionModuleFeeRow
        className="my-2"
        last
        fee={fee}
        gasAmount={gasAmount}
        gasPrice={gasPrice}
      />
      {notAllWithdrawable ? <span className="mt-2">{dict('warningSomeTokensStaked')}</span> : null}
      <div className="mt-2 flex w-full flex-col gap-4">
        {!nothingToClaim ? (
          button
        ) : (
          <Tooltip tooltipContent={dict('noPrincipalClaimableButtonTooltip')}>
            <div>{button}</div>
          </Tooltip>
        )}
      </div>
      {contractCallStatus !== 'idle' ? (
        <>
          <Progress
            className="-mt-2"
            steps={[
              {
                text: {
                  [PROGRESS_STATUS.IDLE]: dict('contractCall.idle', {
                    amount: claimedPrincipalAmount,
                  }),
                  [PROGRESS_STATUS.PENDING]: dict('contractCall.pending', {
                    amount: claimedPrincipalAmount,
                  }),
                  [PROGRESS_STATUS.SUCCESS]: dict('contractCall.success', {
                    amount: claimedPrincipalAmount,
                  }),
                  [PROGRESS_STATUS.ERROR]: errorMessage,
                },
                status: parseContractStatusToProgressStatus(contractCallStatus),
              },
            ]}
          />
          <Button
            className={cn('w-full', !isError && 'hidden')}
            disabled={!isError}
            variant="outline"
            onClick={retry}
            data-testid={ButtonDataTestId.Register_Submit_Solo_Retry}
          >
            {dictShared('retry')}
          </Button>
        </>
      ) : null}
    </>
  );
}
