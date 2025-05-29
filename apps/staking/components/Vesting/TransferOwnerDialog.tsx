import { ActionModuleRow } from '@/components/ActionModule';
import {
  EthereumAddressField,
  getEthereumAddressFormFieldSchema,
} from '@/components/Form/EthereumAddressField';
import { TextWithInlineEnder } from '@/components/TextWithInlineEnder';
import { WalletInteractionButtonWithLocales } from '@/components/WalletInteractionButtonWithLocales';
import {
  formatAndHandleLocalizedContractErrorMessages,
  parseContractStatusToProgressStatus,
} from '@/lib/contracts';
import { useActiveVestingContract } from '@/providers/vesting-provider';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransferBeneficiaryQuery } from '@session/contracts/hooks/TokenVestingStaking';
import { EditButton } from '@session/ui/components/EditButton';
import { PubKey } from '@session/ui/components/PubKey';
import Typography from '@session/ui/components/Typography';
import { toast } from '@session/ui/lib/toast';
import { cn } from '@session/ui/lib/utils';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
import { AlertDialogFooter } from '@session/ui/ui/alert-dialog';
import { Form, FormField, useForm } from '@session/ui/ui/form';
import { areHexesEqual } from '@session/util-crypto/string';
import { useMount } from '@session/util-react/hooks/useMount';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { type Address, isAddress } from 'viem';
import { z } from 'zod';

export function TransferOwnerDialog({ onSuccessCallback }: { onSuccessCallback: () => void }) {
  const dict = useTranslations('vesting.transferBeneficiaryDialog');
  const dictInfo = useTranslations('vesting.infoDialog');
  const dictGeneral = useTranslations('general');
  const dictShared = useTranslations('actionModules.shared');
  const dictEth = useTranslations('actionModules.ethAddress.validation');
  const [newBeneficiary, setNewBeneficiary] = useState<null | Address>(null);

  const contract = useActiveVestingContract();

  const {
    transferBeneficiary,
    contractCallStatus,
    estimateContractWriteFee,
    simulateError,
    transactionError,
    writeError,
    resetContract,
  } = useTransferBeneficiaryQuery(contract?.address!);

  const retry = () => {
    resetContract();
    if (!newBeneficiary) throw new Error('newBeneficiary is null');
    transferBeneficiary([newBeneficiary]);
  };

  const isError = contractCallStatus === 'error';
  const isButtonDisabled = contractCallStatus === 'success' || contractCallStatus === 'pending';

  const TransferBeneficiaryFormSchema = z.object({
    newBeneficiary: getEthereumAddressFormFieldSchema({}),
  });

  const form = useForm<z.infer<typeof TransferBeneficiaryFormSchema>>({
    resolver: zodResolver(TransferBeneficiaryFormSchema),
    defaultValues: {
      newBeneficiary: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof TransferBeneficiaryFormSchema>) => {
    if (!data.newBeneficiary || !isAddress(data.newBeneficiary)) {
      form.setError('newBeneficiary', {
        type: 'manual',
        message: dictEth('invalidAddress'),
      });
      return;
    }

    if (areHexesEqual(data.newBeneficiary, contract?.beneficiary)) {
      form.setError('newBeneficiary', {
        type: 'manual',
        message: dict('errorCantBeSame'),
      });
      return;
    }

    if (areHexesEqual(data.newBeneficiary, contract?.address)) {
      form.setError('newBeneficiary', {
        type: 'manual',
        message: dict('errorCantBeSelf'),
      });
      return;
    }

    setNewBeneficiary(data.newBeneficiary);
  };

  const handleConfirmSubmit = () => {
    if (!newBeneficiary) {
      throw new Error('newBeneficiary is null');
    }
    transferBeneficiary([newBeneficiary]);
  };

  useEffect(() => {
    if (simulateError || writeError || transactionError) {
      form.setError('root', {
        type: 'manual',
        message:
          (simulateError || writeError || transactionError)?.message ?? dictGeneral('unknownError'),
      });
    }
  }, [simulateError, writeError, transactionError, dictGeneral, form]);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: we don't want to re-trigger the toasts
  useEffect(() => {
    if (contractCallStatus === 'success') {
      toast.success(dict('successToast'));
      onSuccessCallback();
    }
  }, [contractCallStatus]);

  useMount(() => {
    estimateContractWriteFee();
  });

  return (
    <>
      {contract ? (
        <div className="flex flex-col gap-4">
          <ActionModuleRow label={dictInfo('address')} tooltip={dictInfo('addressDescription')}>
            <PubKey
              pubKey={contract?.address}
              force="collapse"
              leadingChars={10}
              trailingChars={10}
              alwaysShowCopyButton
            />
          </ActionModuleRow>
          <ActionModuleRow
            label={dict('currentBeneficiary')}
            tooltip={dict('currentBeneficiaryDescription')}
          >
            <PubKey
              pubKey={contract?.beneficiary}
              force="collapse"
              leadingChars={8}
              trailingChars={8}
              alwaysShowCopyButton
            />
          </ActionModuleRow>
          <Form {...form}>
            <form
              className={cn('flex w-full flex-col gap-6 py-4', newBeneficiary ? 'hidden' : '')}
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="newBeneficiary"
                render={({ field }) => (
                  <EthereumAddressField
                    // @ts-expect-error -- TODO: type this
                    field={field}
                    label={dict('newBeneficiary')}
                    tooltip={dict('newBeneficiaryDescription')}
                    dataTestId={InputDataTestId.Beneficiary_Transfer_Beneficiary_Address}
                  />
                )}
              />
            </form>
          </Form>
          {newBeneficiary ? (
            <>
              <ActionModuleRow
                label={dict('newBeneficiary')}
                tooltip={dict('newBeneficiaryDescription')}
              >
                <PubKey
                  pubKey={newBeneficiary}
                  force="collapse"
                  leadingChars={8}
                  trailingChars={8}
                  alwaysShowCopyButton
                />
                <EditButton
                  data-testid={ButtonDataTestId.Vesting_Info_Edit_Beneficiary}
                  onClick={() => setNewBeneficiary(null)}
                />
              </ActionModuleRow>
              <Typography variant="h3" className="text-center">
                {dict.rich('confirmHeading')}
              </Typography>
              <div className="text-base">
                <TextWithInlineEnder
                  text={dict('confirmTextS1', { ethAddress: ' ' })}
                  ender={
                    <PubKey
                      pubKey={contract?.beneficiary}
                      force="collapse"
                      leadingChars={8}
                      trailingChars={8}
                      className="-my-1 font-bold"
                    />
                  }
                />
                <TextWithInlineEnder
                  text={dict('confirmTextS2', { ethAddress: ' ' })}
                  ender={
                    <PubKey
                      pubKey={newBeneficiary}
                      force="collapse"
                      leadingChars={8}
                      trailingChars={8}
                      className="-my-1 font-bold"
                    />
                  }
                />
                {dict.rich('confirmTextS3')}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      <AlertDialogFooter className="mt-4 flex flex-col gap-6 sm:flex-col">
        <WalletInteractionButtonWithLocales
          variant="destructive-outline"
          rounded="md"
          size="lg"
          aria-label={dict('transferButton.aria')}
          className={cn('w-full', newBeneficiary ? 'hidden' : '')}
          data-testid={ButtonDataTestId.Vesting_Transfer_Beneficiary_Submit}
          disabled={
            form.getFieldState('newBeneficiary').invalid ||
            !form.getFieldState('newBeneficiary').isDirty
          }
          onClick={form.handleSubmit(handleSubmit)}
        >
          {dict('transferButton.label')}
        </WalletInteractionButtonWithLocales>
        <WalletInteractionButtonWithLocales
          variant="destructive"
          rounded="md"
          size="lg"
          aria-label={dict('confirmButton.aria')}
          className={cn('w-full', newBeneficiary ? '' : 'hidden')}
          data-testid={ButtonDataTestId.Vesting_Transfer_Beneficiary_Confirm}
          onClick={handleConfirmSubmit}
          disabled={isButtonDisabled}
        >
          {dict('transferButton.label')}
        </WalletInteractionButtonWithLocales>
        {contractCallStatus !== 'idle' ? (
          <>
            <Progress
              className="-mt-2"
              steps={[
                {
                  text: {
                    [PROGRESS_STATUS.IDLE]: dict('contractCall.idle', { newBeneficiary }),
                    [PROGRESS_STATUS.PENDING]: dict('contractCall.pending', { newBeneficiary }),
                    [PROGRESS_STATUS.SUCCESS]: dict('contractCall.success', { newBeneficiary }),
                    [PROGRESS_STATUS.ERROR]: errorMessage,
                  },
                  status: parseContractStatusToProgressStatus(contractCallStatus),
                },
              ]}
            />
            <WalletInteractionButtonWithLocales
              className={cn('w-full', !isError && 'hidden')}
              disabled={!isError}
              variant="outline"
              onClick={retry}
              data-testid={ButtonDataTestId.Register_Submit_Solo_Retry}
            >
              {dictShared('retry')}
            </WalletInteractionButtonWithLocales>
          </>
        ) : null}
      </AlertDialogFooter>
    </>
  );
}
