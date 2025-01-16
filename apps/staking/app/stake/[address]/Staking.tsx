'use client';

import type { GetContributionContractsResponse } from '@session/staking-api-js/client';
import { useTranslations } from 'next-intl';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useWalletButton } from '@session/wallet/providers/wallet-button-provider';
import { useEffect, useMemo, useState } from 'react';
import {
  ActionModuleRow,
  ActionModuleRowSkeleton,
  ActionModuleTooltip,
} from '@/components/ActionModule';
import { PubKey } from '@session/ui/components/PubKey';
import { type DecimalDelimiter, formatPercentage, useDecimalDelimiter } from '@/lib/locale-client';
import { ButtonSkeleton } from '@session/ui/ui/button';
import { PROGRESS_STATUS } from '@session/ui/motion/progress';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { Form, FormField, FormItem, FormMessage, useForm } from '@session/ui/ui/form';
import { SENT_DECIMALS } from '@session/contracts';
import StakeAmountField, {
  getStakeAmountFormFieldSchema,
} from '@/components/Form/StakeAmountField';
import { Input } from '@session/ui/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@session/ui/ui/accordion';
import { type Address, isAddress } from 'viem';
import { NodeContributorList } from '@/components/NodeCard';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { NodeStakingButton } from '@/app/stake/[address]/NodeStakingButton';
import { Loading } from '@session/ui/components/loading';
import { useStakingBackendSuspenseQuery } from '@/lib/staking-api-client';
import { getContributionContracts } from '@/lib/queries/getContributionContracts';
import { areHexesEqual } from '@session/util-crypto/string';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { ManageStake } from '@/app/stake/[address]/ManageStake';
import { NewStake } from '@/app/stake/[address]/NewStake';

export function getContractAndContributor({
  data,
  address,
  connectedAddress,
}: {
  data: Awaited<ReturnType<typeof getContributionContracts>>['data'];
  address: string;
  connectedAddress?: string;
}) {
  const foundContract = data?.contracts?.find((contract) =>
    areHexesEqual(contract.address, address)
  );

  if (!foundContract) {
    return {
      contract: null,
      contributor: null,
    };
  }

  const foundContributor =
    foundContract.contributors.find((contributor) =>
      areHexesEqual(contributor.address, connectedAddress)
    ) ?? null;

  return {
    contract: foundContract,
    contributor: foundContributor,
  };
}

export function StakingActionModuleTitle({ address }: { address: string }) {
  const dict = useTranslations('actionModules.staking');
  const { data } = useStakingBackendSuspenseQuery(getContributionContracts);

  const { address: connectedAddress } = useWallet();

  const { contributor } = useMemo(
    () => getContractAndContributor({ data, address, connectedAddress }),
    [data, address, connectedAddress]
  );

  return dict(contributor ? 'titleManageStake' : 'titleNewStake');
}

export default function Staking({ address }: { address: string }) {
  const { data, isLoading } = useStakingBackendSuspenseQuery(getContributionContracts);
  const dictionary = useTranslations('general');

  const { address: connectedAddress } = useWallet();

  const { contract, contributor } = useMemo(
    () => getContractAndContributor({ data, address, connectedAddress }),
    [data, address, connectedAddress]
  );

  return isLoading ? (
    <Loading />
  ) : contract ? (
    contributor ? (
      <ManageStake contract={contract} />
    ) : (
      <NewStake contract={contract} />
    )
  ) : (
    <span>{dictionary('nodeNotFound')}</span>
  );
}

type GetStakeFormSchemaArgs = {
  minStake: bigint;
  maxStake: bigint;
  isOperator?: boolean;
  decimalDelimiter: DecimalDelimiter;
};

export const getStakeFormSchema = ({
  minStake,
  maxStake,
  isOperator,
  decimalDelimiter,
}: GetStakeFormSchemaArgs) => {
  return z.object({
    beneficiaryAddress: z
      .string()
      .optional()
      .refine((value) => {
        if (!value) return true;
        return isAddress(value);
      }),

    stakeAmount: getStakeAmountFormFieldSchema({
      minStake,
      maxStake,
      isOperator,
      decimalDelimiter,
    }),
  });
};

export type StakeFormSchema = z.infer<ReturnType<typeof getStakeFormSchema>>;
export type ParsedStakeData = {
  stakeAmount: bigint;
  beneficiaryAddress?: Address;
};

export function NodeStakingForm({
  node,
}: {
  node: GetContributionContractsResponse['contracts'][number];
}) {
  const dictionary = useTranslations('actionModules.register');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');
  const sessionNodeStakingDictionary = useTranslations('sessionNodes.staking');
  const actionModuleDictionary = useTranslations('actionModules');
  const { isConnected } = useWallet();
  const { setIsBalanceVisible } = useWalletButton();

  const { enabled: isOpenNodeContributionDisabled } = useRemoteFeatureFlagQuery(
    REMOTE_FEATURE_FLAG.DISABLE_NODE_STAKING_MULTI
  );

  const contractAddress = node.address;

  const [finalisedFormData, setFinalisedFormData] = useState<ParsedStakeData | null>(null);
  const [multiStatus, setMultiStatus] = useState<PROGRESS_STATUS>(PROGRESS_STATUS.IDLE);

  const disableInputs = useMemo(() => {
    return multiStatus === PROGRESS_STATUS.PENDING || multiStatus === PROGRESS_STATUS.SUCCESS;
  }, [multiStatus]);

  const decimalDelimiter = useDecimalDelimiter();
  const { minStake, maxStake, totalStaked } = getContributionRangeFromContributors(
    node.contributors
  );

  const FormSchema = getStakeFormSchema({
    minStake,
    maxStake,
    isOperator: false,
    decimalDelimiter,
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      stakeAmount: bigIntToString(maxStake, SENT_DECIMALS, decimalDelimiter),
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const watchedStakeAmount = form.watch('stakeAmount');

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const bigIntStakeAmount = stringToBigInt(data.stakeAmount, SENT_DECIMALS);

    const beneficiaryAddress = data.beneficiaryAddress;

    if (beneficiaryAddress && !isAddress(beneficiaryAddress)) {
      form.setError('beneficiaryAddress', {
        type: 'manual',
        message: 'Invalid address',
      });
      return;
    }

    setFinalisedFormData({
      stakeAmount: bigIntStakeAmount,
      beneficiaryAddress: beneficiaryAddress as Address | undefined,
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
        <ActionModuleRow
          label={actionModuleDictionary('node.contributors')}
          tooltip={actionModuleDictionary('node.contributorsTooltip')}
        >
          <span className="flex flex-row flex-wrap items-center gap-2 align-middle">
            <NodeContributorList contributors={node.contributors} forceExpand showEmptySlots />
          </span>
        </ActionModuleRow>
        <ActionModuleRow
          label={sessionNodeStakingDictionary('stakedAmount')}
          tooltip={sessionNodeStakingDictionary('stakedAmountDescription')}
        >
          {formatSENTBigInt(totalStaked)}
        </ActionModuleRow>
        <ActionModuleRow
          label={sessionNodeDictionary('publicKeyShort')}
          tooltip={sessionNodeDictionary('publicKeyDescription')}
        >
          <PubKey pubKey={node.service_node_pubkey} force="collapse" alwaysShowCopyButton />
        </ActionModuleRow>
        <ActionModuleRow
          label={sessionNodeDictionary('operatorAddress')}
          tooltip={sessionNodeDictionary('operatorAddressTooltip')}
        >
          {node.operator_address ? (
            <PubKey pubKey={node.operator_address} force="collapse" alwaysShowCopyButton />
          ) : null}
        </ActionModuleRow>
        <ActionModuleRow
          label={sessionNodeDictionary('operatorFee')}
          tooltip={sessionNodeDictionary('operatorFeeDescription')}
        >
          {formatPercentage(node.fee / 10000)}
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <NodeStakingButton
          watchedStakeAmount={watchedStakeAmount}
          formData={finalisedFormData}
          disabled={!form.formState.isValid}
          setMultiStatus={setMultiStatus}
          openNodeContractAddress={contractAddress as Address}
          isOpenNodeContributionDisabled={isOpenNodeContributionDisabled}
        />
      </form>
    </Form>
  );
}

export function NodeStakingFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ButtonSkeleton rounded="lg" size="lg" />
    </div>
  );
}