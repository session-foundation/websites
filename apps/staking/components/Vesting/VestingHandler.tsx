'use client';

import { getEthereumAddressFormFieldSchema } from '@/components/Form/EthereumAddressField';
import { NodeItem, NodeItemLabel, NodeItemValue } from '@/components/InfoNodeCard';
import { NodeCard } from '@/components/NodeCard';
import { useVesting } from '@/providers/vesting-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { PubKey } from '@session/ui/components/PubKey';
import { Button } from '@session/ui/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@session/ui/ui/form';
import { RadioGroup, RadioGroupItem } from '@session/ui/ui/radio-group';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

export type VestingHandlerProps = {
  onCancelCallback?: () => void;
  onSuccessCallback?: () => void;
  collapseAddress?: boolean;
  hideSkipButton?: boolean;
};

export function VestingHandler({
  onSuccessCallback,
  onCancelCallback,
  collapseAddress,
  hideSkipButton,
}: VestingHandlerProps) {
  const dict = useTranslations('vesting.startDialog');
  const dictCard = useTranslations('vesting.card');
  const dictEth = useTranslations('actionModules.ethAddress.validation');
  const { contracts, connectToVestingContract, disconnectFromVestingContract, activeContract } =
    useVesting();

  const VestingContractFormSchema = z.object({
    contractAddress: getEthereumAddressFormFieldSchema({}),
  });

  const form = useForm<z.infer<typeof VestingContractFormSchema>>({
    resolver: zodResolver(VestingContractFormSchema),
    defaultValues: {
      contractAddress: activeContract?.address ?? '',
    },
  });

  const handleSubmit = (data: z.infer<typeof VestingContractFormSchema>) => {
    if (!data.contractAddress) return;
    const contract = contracts.find(({ address }) => address === data.contractAddress);

    if (!contract) {
      form.setError('root', {
        type: 'manual',
        message: dictEth('invalidAddress'),
      });
      return;
    }

    onSuccessCallback?.();
    connectToVestingContract(contract);
  };

  const handleSkip = () => {
    onCancelCallback?.();
    disconnectFromVestingContract();
  };

  return (
    <Form {...form}>
      <form className="flex w-full flex-col gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="contractAddress"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex w-full flex-col gap-3"
                >
                  {contracts.map((contract) => (
                    <NodeCard className="w-full" key={contract.address}>
                      <FormItem
                        key={contract.address}
                        className="flex items-center justify-between space-y-0"
                      >
                        <FormLabel className="inline-flex flex-col gap-1.5 align-middle font-medium">
                          {collapseAddress ? (
                            <PubKey
                              className="-mt-1"
                              pubKey={contract.address}
                              force="collapse"
                              leadingChars={16}
                              trailingChars={16}
                            />
                          ) : (
                            <>
                              <span className="block md:hidden">
                                <PubKey
                                  pubKey={contract.address}
                                  force="collapse"
                                  leadingChars={8}
                                  trailingChars={8}
                                />
                              </span>
                              <span className="hidden md:block">{contract.address}</span>
                            </>
                          )}
                          <NodeItem>
                            <NodeItemLabel>{dictCard('balance')}</NodeItemLabel>
                            <NodeItemValue>
                              {formatSENTBigInt(contract.initial_amount, SENT_DECIMALS)}
                            </NodeItemValue>
                          </NodeItem>
                        </FormLabel>
                        <FormControl>
                          <RadioGroupItem value={contract.address} />
                        </FormControl>
                      </FormItem>
                    </NodeCard>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full flex-row gap-4">
          <Button
            className="w-full uppercase"
            data-testid={ButtonDataTestId.Vesting_Start_Continue}
            aria-label={dict('continueButton.aria')}
            type="submit"
            disabled={!form.formState.isValid || !form.watch('contractAddress')}
          >
            {dict('continueButton.label')}
          </Button>
          {!hideSkipButton ? (
            <Button
              className="w-full uppercase"
              data-testid={ButtonDataTestId.Vesting_Start_Skip}
              aria-label={dict('skipButton.aria')}
              variant="outline"
              onClick={handleSkip}
              type="reset"
            >
              {dict('skipButton.label')}
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
