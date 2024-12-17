'use client';

import { type LoadRegistrationsResponse, NODE_STATE } from '@session/sent-staking-js/client';
import { useTranslations } from 'next-intl';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useWalletButton } from '@session/wallet/providers/wallet-button-provider';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { getDateFromUnixTimestampSeconds } from '@session/util-js/date';
import { useRegisteredNode } from '@/hooks/useRegisteredNode';
import { useEffect, useMemo, useState } from 'react';
import { StakedNodeCard } from '@/components/StakedNodeCard';
import {
  ActionModuleRow,
  ActionModuleRowSkeleton,
  ActionModuleTooltip,
} from '@/components/ActionModule';
import { PubKey } from '@session/ui/components/PubKey';
import { Tooltip } from '@session/ui/ui/tooltip';
import {
  type DecimalDelimiter,
  formatDate,
  formatLocalizedRelativeTimeToNowClient,
  getDecimalDelimiter,
} from '@/lib/locale-client';
import { Button, ButtonSkeleton } from '@session/ui/ui/button';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { PROGRESS_STATUS } from '@session/ui/motion/progress';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@session/ui/ui/form';
import { SENT_DECIMALS } from '@session/contracts';
import StakeAmountField, {
  getStakeAmountFormFieldSchema,
} from '@/components/Form/StakeAmountField';
import { Input } from '@session/ui/ui/input';
import { cn } from '@session/ui/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@session/ui/ui/accordion';
import { type Address, isAddress } from 'viem';
import { Switch } from '@session/ui/ui/switch';
import { type ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';
import { safeTrySync } from '@session/util-js/try';
import { RegisterMultiNodeButton } from '@/app/register/[nodeId]/RegisterMultiNodeButton';
import { RegisterSoloNodeButton } from '@/app/register/[nodeId]/RegisterSoloNodeButton';
import { OpenNodeCard } from '@/components/OpenNodeCard';

type GetRegistrationFormSchemaArgs = {
  minStake: bigint;
  maxStake: bigint;
  isOperator?: boolean;
  decimalDelimiter: DecimalDelimiter;
};

export const getRegistrationFormSchema = ({
  minStake,
  maxStake,
  isOperator,
  decimalDelimiter,
}: GetRegistrationFormSchemaArgs) => {
  return z.object({
    operatorFee: z
      .string()
      .regex(/^[0-9]*[.,]?[0-9]*$/)
      .refine((value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return true;
        return num <= 100;
      })
      .refine((value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return true;
        return num >= 0;
      })
      .optional(),
    autoRegister: z.boolean().default(true),
    beneficiaryAddress: z
      .string()
      .optional()
      .refine((value) => {
        if (!value) return true;
        return isAddress(value);
      }),
    reservedContributors: z.array(
      z.object({
        addr: z.string().transform((value) => value.toLowerCase()),
        amount: z.string().transform((value) => stringToBigInt(value, SENT_DECIMALS)),
      })
    ),
    stakeAmount: getStakeAmountFormFieldSchema({
      minStake,
      maxStake,
      isOperator,
      decimalDelimiter,
    }),
  });
};

export type RegistrationFormSchema = z.infer<ReturnType<typeof getRegistrationFormSchema>>;
export type ParsedRegistrationData = {
  stakeAmount: bigint;
  operatorFee: number;
  autoRegister: boolean;
  beneficiaryAddress?: Address;
  reservedContributors: Array<ReservedContributorStruct>;
};

export function NodeRegistrationForm({
  node,
}: {
  node: LoadRegistrationsResponse['registrations'][number];
}) {
  const dictionary = useTranslations('actionModules.register');
  const registerCardDictionary = useTranslations('nodeCard.pending');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');
  const actionModuleDictionary = useTranslations('actionModules');
  const { isConnected } = useWallet();
  const { setIsBalanceVisible } = useWalletButton();

  const [finalisedFormData, setFinalisedFormData] = useState<ParsedRegistrationData | null>(null);
  const [soloStatus, setSoloStatus] = useState<PROGRESS_STATUS>(PROGRESS_STATUS.IDLE);
  const [multiStatus, setMultiStatus] = useState<PROGRESS_STATUS>(PROGRESS_STATUS.IDLE);

  const disableInputs = useMemo(() => {
    return (
      soloStatus === PROGRESS_STATUS.PENDING ||
      soloStatus === PROGRESS_STATUS.SUCCESS ||
      multiStatus === PROGRESS_STATUS.PENDING ||
      multiStatus === PROGRESS_STATUS.SUCCESS ||
      // TODO - remove this once we solve the bug that allows for switching registration type after submit
      !!finalisedFormData
    );
  }, [multiStatus, soloStatus, finalisedFormData]);

  const decimalDelimiter = getDecimalDelimiter();
  const fullStake = SESSION_NODE_FULL_STAKE_AMOUNT;
  const maxStake = fullStake;
  const minStake = fullStake / BigInt(4);

  const { enabled: isRegistrationPausedFlagEnabled, isLoading: isRemoteFlagLoading } =
    useRemoteFeatureFlagQuery(REMOTE_FEATURE_FLAG.DISABLE_NODE_REGISTRATION);

  const { enabled: isReservedRegDisabled } = useRemoteFeatureFlagQuery(
    REMOTE_FEATURE_FLAG.DISABLE_NODE_REGISTRATION_RESERVED
  );

  const preparationDate = getDateFromUnixTimestampSeconds(node.timestamp);

  const { found, openNode, stakedNode, runningNode, networkTime, blockHeight } = useRegisteredNode({
    pubKeyEd25519: node.pubkey_ed25519,
  });

  const FormSchema = getRegistrationFormSchema({
    minStake,
    maxStake,
    isOperator: true,
    decimalDelimiter,
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      stakeAmount: bigIntToString(maxStake, SENT_DECIMALS, decimalDelimiter),
      autoRegister: true,
      reservedContributors: [],
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const watchedStakeAmount = form.watch('stakeAmount');
  const watchedReservedSlots = form.watch('reservedContributors');

  const isSolo =
    (watchedStakeAmount ? stringToBigInt(watchedStakeAmount, SENT_DECIMALS) : fullStake) ===
    fullStake;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const bigIntStakeAmount = stringToBigInt(data.stakeAmount, SENT_DECIMALS);
    const [err, operatorFee] = safeTrySync(() =>
      data.operatorFee ? Math.trunc(parseFloat(data.operatorFee.substring(0, 5)) * 100) : 0
    );

    if (err) {
      form.setError('operatorFee', {
        type: 'manual',
        message: actionModuleDictionary('operatorFee.validation.unableToParse'),
      });
      return;
    }

    const beneficiaryAddress = data.beneficiaryAddress;

    if (beneficiaryAddress && !isAddress(beneficiaryAddress)) {
      form.setError('beneficiaryAddress', {
        type: 'manual',
        message: actionModuleDictionary('beneficiaryAddress.validation.invalidAddress'),
      });
      return;
    }

    setFinalisedFormData({
      operatorFee,
      autoRegister: data.autoRegister,
      stakeAmount: bigIntStakeAmount,
      beneficiaryAddress: beneficiaryAddress as Address | undefined,
      reservedContributors: data.reservedContributors as Array<ReservedContributorStruct>,
    });
  }

  /** While the component is mounted, show the balance */
  useEffect(() => {
    setIsBalanceVisible(true);
    return () => {
      setIsBalanceVisible(false);
    };
  }, [setIsBalanceVisible]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {!isRemoteFlagLoading && isRegistrationPausedFlagEnabled ? (
          <span>{dictionary('disabled')}</span>
        ) : null}
        {stakedNode && stakedNode.state === NODE_STATE.RUNNING ? (
          <>
            <span className="mb-4 text-lg font-medium">
              {dictionary.rich('notFound.foundRunningNode')}
            </span>
            <StakedNodeCard node={stakedNode} networkTime={networkTime} blockHeight={blockHeight} />
          </>
        ) : runningNode && runningNode.state === NODE_STATE.RUNNING ? (
          <>
            <span className="mb-4 text-lg font-medium">
              {dictionary('notFound.foundRunningNodeOtherOperator')}
            </span>
            <StakedNodeCard
              node={runningNode}
              networkTime={networkTime}
              blockHeight={blockHeight}
              hideButton
            />
          </>
        ) : openNode ? (
          <>
            <span className="mb-4 text-lg font-medium">{dictionary('notFound.foundOpenNode')}</span>
            <OpenNodeCard node={openNode} forceSmall />
          </>
        ) : null}
        <ActionModuleRow
          label={sessionNodeDictionary('publicKeyShort')}
          tooltip={sessionNodeDictionary('publicKeyDescription')}
        >
          <PubKey pubKey={node.pubkey_ed25519} force="collapse" alwaysShowCopyButton />
        </ActionModuleRow>
        <ActionModuleRow
          label={registerCardDictionary('type')}
          tooltip={registerCardDictionary('typeDescription')}
        >
          <div className="flex flex-row items-center gap-1 align-middle">
            {registerCardDictionary(isSolo ? 'solo' : 'multi')}
            <ActionModuleTooltip>
              {registerCardDictionary(isSolo ? 'soloDescription' : 'multiDescription')}
            </ActionModuleTooltip>
          </div>
        </ActionModuleRow>
        <ActionModuleRow
          label={dictionary('preparedAtTimestamp')}
          tooltip={dictionary('preparedAtTimestampDescription')}
        >
          <Tooltip
            tooltipContent={formatDate(preparationDate, {
              dateStyle: 'full',
              timeStyle: 'full',
            })}
          >
            <div className="cursor-pointer">
              {formatLocalizedRelativeTimeToNowClient(preparationDate, { addSuffix: true })}
            </div>
          </Tooltip>
        </ActionModuleRow>
        <ActionModuleRow
          label={sessionNodeDictionary('operatorFee')}
          tooltip={sessionNodeDictionary('operatorFeeDescription')}
        >
          <FormField
            control={form.control}
            name="operatorFee"
            render={({ field: { value, onChange, ...field } }) => {
              const thousandsSeparator = decimalDelimiter === '.' ? ',' : '.';
              const formatInputText = (value: string) => {
                if (value === '0') return '0';
                // Remove non-numeric characters and non-decimal delimiters
                let formattedValue = value.replace(/[^0-9.,]/g, '');

                // Remove thousands separators
                if (formattedValue.includes(thousandsSeparator)) {
                  formattedValue = formattedValue.replaceAll(thousandsSeparator, '');
                }

                // Remove any leading zeroes except when its `0.`
                if (formattedValue.startsWith('0') && !formattedValue.startsWith('0.')) {
                  formattedValue = formattedValue.replace(/^0+/, '');
                }

                // Remove all but the first decimal delimiter
                if (formattedValue.includes(decimalDelimiter)) {
                  const [first, ...rest] = formattedValue.split(decimalDelimiter);

                  const decimalValue = rest.join('').slice(0, 2);
                  formattedValue = `${first}${decimalDelimiter}${decimalValue}`;
                  // If the value is greater than the full stake, return the full stake
                }

                if (parseFloat(formattedValue) > 100) {
                  return '100';
                }

                return formattedValue;
              };

              return (
                <FormItem className="-my-1 flex flex-col">
                  <div className="flex flex-row items-center gap-1 align-middle">
                    <FormControl>
                      <Input
                        placeholder="0"
                        disabled={!isConnected || form.formState.isSubmitting || disableInputs}
                        className={cn(
                          isSolo && 'hidden',
                          'h-auto w-14 rounded-lg border-[2px] border-[#668C83] border-opacity-80 px-1.5 py-1 shadow-md'
                        )}
                        value={value}
                        onChange={(e) => onChange(formatInputText(e.target.value))}
                        onPaste={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          return onChange(formatInputText(e.clipboardData.getData('text/plain')));
                        }}
                        {...field}
                      />
                    </FormControl>
                    {!isSolo ? (
                      '%'
                    ) : (
                      <>
                        <span>{dictionary('feeNA')}</span>
                        <ActionModuleTooltip>{dictionary('feeNADescription')}</ActionModuleTooltip>
                      </>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </ActionModuleRow>
        <FormField
          control={form.control}
          name="stakeAmount"
          render={({ field: { value, onChange, ...field } }) => (
            <StakeAmountField
              disabled={disableInputs}
              minStake={minStake}
              maxStake={maxStake}
              decimalDelimiter={decimalDelimiter}
              watchedStakeAmount={watchedStakeAmount}
              onChange={onChange}
              field={field}
              value={value}
            />
          )}
        />
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>{dictionary('advancedOptions.title')}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              {!isSolo ? (
                <ActionModuleRow
                  label={dictionary('advancedOptions.autoRegister')}
                  tooltip={dictionary('advancedOptions.autoRegisterDescription')}
                >
                  <FormItem className="flex flex-col">
                    <FormField
                      control={form.control}
                      name="autoRegister"
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          checked={value}
                          onCheckedChange={onChange}
                          disabled={disableInputs}
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                </ActionModuleRow>
              ) : null}
              <FormItem className="flex flex-col">
                <FormField
                  control={form.control}
                  name="beneficiaryAddress"
                  render={({ field }) => (
                    <div className="flex w-full flex-col items-center gap-2">
                      <div className="flex w-full justify-between gap-2 text-nowrap">
                        <span className="inline-flex items-center gap-2 text-nowrap align-middle">
                          {dictionary('advancedOptions.beneficiary')}
                          <ActionModuleTooltip>
                            {dictionary('advancedOptions.beneficiaryDescription')}
                          </ActionModuleTooltip>
                        </span>
                      </div>
                      <Input
                        placeholder={'0x...'}
                        disabled={!isConnected || disableInputs}
                        className="w-full"
                        {...field}
                      />
                    </div>
                  )}
                />
                <FormMessage />
              </FormItem>
              {!isSolo ? (
                !isReservedRegDisabled ? (
                  <Button
                    data-testid={ButtonDataTestId.Register_Add_Reserved}
                    rounded="lg"
                    size="lg"
                    variant="outline"
                    disabled={
                      // TODO: enable when its built
                      true ||
                      isRegistrationPausedFlagEnabled ||
                      isRemoteFlagLoading ||
                      !form.formState.isValid
                    }
                  >
                    {dictionary('button.addReserved')}
                  </Button>
                ) : (
                  <Tooltip tooltipContent={dictionary('button.addReservedDisabledDescription')}>
                    <div>
                      <Button
                        data-testid={ButtonDataTestId.Register_Add_Reserved}
                        rounded="lg"
                        size="lg"
                        variant="outline"
                        disabled
                        className="w-full"
                      >
                        {dictionary('button.addReserved')}
                      </Button>
                    </div>
                  </Tooltip>
                )
              ) : null}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <RegisterMultiNodeButton
          className={cn(soloStatus !== PROGRESS_STATUS.IDLE && 'hidden')}
          isSolo={isSolo}
          nodePubKey={node.pubkey_ed25519}
          blsPubKey={node.pubkey_bls}
          blsSignature={node.sig_bls}
          userSignature={node.sig_ed25519}
          watchedReservedSlots={watchedReservedSlots}
          formData={finalisedFormData}
          disabled={
            found ||
            isRegistrationPausedFlagEnabled ||
            isRemoteFlagLoading ||
            !form.formState.isValid
          }
          isRegistrationPausedFlagEnabled={isRegistrationPausedFlagEnabled}
          setMultiStatus={setMultiStatus}
          multiStatus={multiStatus}
        />
        <RegisterSoloNodeButton
          className={cn(multiStatus !== PROGRESS_STATUS.IDLE && 'hidden')}
          isSolo={isSolo}
          nodePubKey={node.pubkey_ed25519}
          blsPubKey={node.pubkey_bls}
          blsSignature={node.sig_bls}
          userSignature={node.sig_ed25519}
          disabled={found || isRegistrationPausedFlagEnabled || isRemoteFlagLoading}
          isRegistrationPausedFlagEnabled={isRegistrationPausedFlagEnabled}
          setSoloStatus={setSoloStatus}
        />
      </form>
    </Form>
  );
}

export function NodeRegistrationFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ButtonSkeleton rounded="lg" size="lg" />
    </div>
  );
}
