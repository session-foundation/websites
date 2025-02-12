import type { ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';
import React, { useEffect, useRef, useState } from 'react';
import { isAddress } from 'viem';
import { ReservedStakesTable } from '@/components/ReservedStakesTable';
import {
  type MultiRegistrationFormSchema,
  REGISTRATION_QUERY_PARAM,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { useTranslations } from 'next-intl';
import { REG_MODE, REG_TAB } from '@/app/register/[nodeId]/types';
import { Form, FormField, useForm } from '@session/ui/ui/form';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { PlusIcon } from '@session/ui/icons/PlusIcon';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import EthereumAddressField, {
  getEthereumAddressFormFieldSchema,
} from '@/components/Form/EthereumAddressField';
import StakeAmountField, {
  getStakeAmountFormFieldSchema,
  type GetStakeAmountFormFieldSchemaArgs,
} from '@/components/Form/StakeAmountField';
import { SESSION_NODE, SESSION_NODE_FULL_STAKE_AMOUNT } from '@/lib/constants';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import { useDecimalDelimiter } from '@/lib/locale-client';
import { getContributionRangeFromContributors } from '@/lib/maths';
import { cn } from '@session/ui/lib/utils';
import { safeTrySync } from '@session/util-js/try';
import { bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { TOKEN } from '@session/contracts';
import { areHexesEqual } from '@session/util-crypto/string';

export const getContributionRangeFromReservedContributorStructs = (
  contributors: Array<ReservedContributorStruct> = []
) => {
  return getContributionRangeFromContributors(
    contributors
      .map((slot) => {
        const [err, amount] = safeTrySync(() => Number(slot.amount));
        if (err) {
          console.log(err);
          return null;
        }
        return {
          address: slot.addr,
          amount: amount,
          reserved: amount,
        };
      })
      .filter((v) => v !== null)
  );
};

export const isValidReservedSlot = (slot: object | null): slot is ReservedContributorStruct => {
  if (!slot || !('addr' in slot) || !('amount' in slot)) return false;

  if (typeof slot.addr !== 'string' || !isAddress(slot.addr)) return false;

  return typeof slot.amount === 'bigint';
};

export const isValidReservedSlots = (
  slots: Array<object | null>
): slots is Array<ReservedContributorStruct> => {
  if (!Array.isArray(slots)) return false;

  if (slots.length === 0) return true;

  const contributors: Array<ReservedContributorStruct> = [];

  for (const slot of slots) {
    if (!isValidReservedSlot(slot)) return false;

    const { minStake, maxStake } = getContributionRangeFromReservedContributorStructs(contributors);

    if (slot.amount < minStake || slot.amount > maxStake) {
      return false;
    }

    contributors.push(slot);
  }

  return true;
};

export const getReservedStakeSchema = ({ amount }: { amount: GetStakeAmountFormFieldSchemaArgs }) =>
  z.object({
    addr: getEthereumAddressFormFieldSchema({ required: true }),
    amount: getStakeAmountFormFieldSchema(amount),
  });

export type ReservedStakeSchema = z.infer<ReturnType<typeof getReservedStakeSchema>>;

export function ReserveSlotsInputTab() {
  const [isNewSlotFormVisible, setIsNewSlotFormVisible] = useState<boolean>(false);
  const [isEditingExistingSlot, setIsEditingExistingSlot] = useState<boolean>(false);

  const { formMulti, changeTab, mode, setBackButtonClickCallback, pushQueryParam } =
    useRegistrationWizard();

  const reservedStakes = formMulti.watch('reservedContributors');
  const { minStake, maxStake, totalStaked } =
    getContributionRangeFromReservedContributorStructs(reservedStakes);

  const initialReservedStakes = useRef<Array<ReservedContributorStruct>>(reservedStakes);

  const dict = useTranslations('actionModules.registration.reserveSlotsInput');
  const dictAddress = useTranslations('actionModules.ethAddress.validation');
  const dictConfirm = useTranslations('actionModules.registration.shared.buttonConfirm');
  const dictStakeAmount = useTranslations('actionModules.stakeAmount.validation');

  const handleBackButtonClick = () => {
    if (mode === REG_MODE.EDIT) {
      formMulti.setValue('reservedContributors', initialReservedStakes.current);
    }
  };

  /**
   * react-hook-form can't recompute the default value of the slot amount field, which we need
   * as it changes now that a new slot is added. After resetting we need to recompute the value
   * and explicitly set it.
   */
  const recomputeFormDefaultsAndReset = (newSlots: Array<ReservedContributorStruct>) => {
    formSlot.reset();
    const { minStake } = getContributionRangeFromReservedContributorStructs(newSlots);
    formSlot.setValue('amount', bigIntToString(minStake, TOKEN.DECIMALS, decimalDelimiter));
  };

  const handleSubmit = (data: MultiRegistrationFormSchema) => {
    const [err] = safeTrySync(() =>
      pushQueryParam(
        REGISTRATION_QUERY_PARAM.RESERVED_CONTRIBUTORS,
        JSON.stringify(data.reservedContributors, (_, v) =>
          typeof v === 'bigint' ? v.toString() : v
        )
      )
    );

    if (err) {
      console.error(err);
    }

    changeTab(mode === REG_MODE.EDIT ? REG_TAB.SUBMIT_MULTI : REG_TAB.AUTO_ACTIVATE);
  };

  const decimalDelimiter = useDecimalDelimiter();

  const formSlot = useForm<ReservedStakeSchema>({
    resolver: zodResolver(
      getReservedStakeSchema({
        amount: {
          isOperator: false,
          decimalDelimiter,
          minStake,
          maxStake,
          underMinMessage: dict('validation.underMin', {
            min: formatSENTBigIntNoRounding(minStake),
          }),
          underMinOperatorMessage: dictStakeAmount('underMinOperator', {
            min: formatSENTBigIntNoRounding(minStake),
          }),
          overMaxMessage: dict('validation.overMax', {
            max: formatSENTBigIntNoRounding(maxStake),
          }),
        },
      })
    ),
    defaultValues: {
      addr: '',
      amount: bigIntToString(minStake, TOKEN.DECIMALS, decimalDelimiter),
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const handleSubmitSlot = (data: ReservedStakeSchema) => {
    if (!data.addr || !isAddress(data.addr)) {
      formSlot.setError('addr', {
        type: 'manual',
        message: dictAddress('invalidAddress'),
      });
      return;
    }

    const address = data.addr;

    if (reservedStakes.find((slot) => areHexesEqual(slot.addr, address))) {
      formSlot.setError('addr', {
        type: 'manual',
        message: dict('validation.addressAlreadyUsed'),
      });
      return;
    }

    const [errBigInt, stakeAmount] = safeTrySync(() => stringToBigInt(data.amount, TOKEN.DECIMALS));

    if (errBigInt) {
      formMulti.setError('root', {
        type: 'manual',
        message: dictStakeAmount('incorrectFormat'),
      });
      return;
    }

    const slot = { addr: address, amount: stakeAmount };

    if (!isValidReservedSlot(slot)) {
      formSlot.setError('amount', {
        type: 'manual',
        message: dict('validation.slotInvalid'),
      });
      return;
    }

    const newSlots = [...reservedStakes, slot];

    if (!isValidReservedSlots(newSlots)) {
      formMulti.setError('root', {
        type: 'manual',
        message: dict('validation.invalidReservedSlots'),
      });
      return;
    }

    formMulti.setValue('reservedContributors', newSlots);
    setIsNewSlotFormVisible(false);
    setIsEditingExistingSlot(false);
    recomputeFormDefaultsAndReset(newSlots);
  };

  const handleRemoveSlot = (i: number) => {
    /**
     * NOTE: Only the last slot can be removed. TODO: investigate if we can do out of order removals as this is better UX.
     */
    const newSlots = reservedStakes.filter((_, j) => i !== j);

    formMulti.setValue('reservedContributors', newSlots);
    recomputeFormDefaultsAndReset(newSlots);
  };

  const handleEditSlot = (i: number) => {
    /**
     * NOTE: Only the last slot can be edited. TODO: investigate if we can do out of order editing as this is better UX.
     */
    const slot = reservedStakes[i];

    if (!slot) {
      console.error('Slot not found in reserved slots array. Cannot edit slot.');
      return;
    }

    const newSlots = reservedStakes.filter((_, j) => i !== j);

    formMulti.setValue('reservedContributors', newSlots);
    recomputeFormDefaultsAndReset(newSlots);
    formSlot.setValue('amount', bigIntToString(slot.amount, TOKEN.DECIMALS, decimalDelimiter));
    formSlot.setValue('addr', slot.addr);
    setIsEditingExistingSlot(true);
    setIsNewSlotFormVisible(true);
  };

  useEffect(() => {
    setBackButtonClickCallback(() => handleBackButtonClick);
    return () => setBackButtonClickCallback(null);
  }, []);

  const canReserveSlots =
    reservedStakes.length < SESSION_NODE.MAX_CONTRIBUTORS &&
    totalStaked < SESSION_NODE_FULL_STAKE_AMOUNT;

  return (
    <div className="flex w-full flex-col gap-6">
      <ReservedStakesTable
        reservedStakes={reservedStakes}
        editRowOnClick={handleEditSlot}
        removeRowOnClick={handleRemoveSlot}
        actionButton={
          canReserveSlots && !isNewSlotFormVisible ? (
            <Button
              variant="default"
              rounded="full"
              size="icon"
              onClick={() => setIsNewSlotFormVisible(true)}
              disabled={reservedStakes.length === SESSION_NODE.MAX_CONTRIBUTORS}
              data-testid={ButtonDataTestId.Registration_Reserved_Stakes_Add_Slot}
            >
              <PlusIcon className="fill-session-text h-4 w-4" />
            </Button>
          ) : null
        }
        isEditable
      >
        <Form {...formSlot}>
          <form
            className={cn('flex w-full flex-col gap-6 p-6', isNewSlotFormVisible ? '' : 'hidden')}
            onSubmit={formSlot.handleSubmit(handleSubmitSlot)}
          >
            <FormField
              control={formSlot.control}
              name="addr"
              render={({ field }) => (
                <EthereumAddressField
                  // @ts-expect-error -- TODO: type this
                  field={field}
                  label={dict('address')}
                  tooltip={dict('addressDescription')}
                  dataTestId={InputDataTestId.Registration_Reserved_Stake_Address}
                />
              )}
            />
            <FormField
              control={formSlot.control}
              name={'amount'}
              render={({ field }) => (
                <StakeAmountField
                  minStake={minStake}
                  maxStake={maxStake}
                  watchedStakeAmount={formSlot.watch('amount')}
                  stakeAmountDescription={dict('stakeAmountDescription')}
                  field={field}
                  dataTestId={InputDataTestId.Registration_Reserved_Stake_Amount}
                  dataTestIds={{
                    buttonMin: ButtonDataTestId.Registration_Reserved_Stake_Amount_Min,
                    buttonMax: ButtonDataTestId.Registration_Reserved_Stake_Amount_Max,
                    slider0: ButtonDataTestId.Registration_Reserved_Stake_Amount_Slider_0,
                    slider25: ButtonDataTestId.Registration_Reserved_Stake_Amount_Slider_25,
                    slider50: ButtonDataTestId.Registration_Reserved_Stake_Amount_Slider_50,
                    slider75: ButtonDataTestId.Registration_Reserved_Stake_Amount_Slider_75,
                    slider100: ButtonDataTestId.Registration_Reserved_Stake_Amount_Slider_100,
                    sliderMin: ButtonDataTestId.Registration_Reserved_Stake_Amount_Slider_Min,
                    sliderMax: ButtonDataTestId.Registration_Reserved_Stake_Amount_Slider_Max,
                  }}
                />
              )}
            />
            <Button
              variant={isEditingExistingSlot ? 'destructive' : 'destructive-outline'}
              aria-label={dict(
                isEditingExistingSlot ? 'buttonDeleteCancel.aria' : 'buttonCancel.aria'
              )}
              onClick={() => setIsNewSlotFormVisible(false)}
              data-testid={ButtonDataTestId.Registration_Reserved_Stakes_Cancel_Slot}
            >
              {dict(isEditingExistingSlot ? 'buttonDeleteCancel.text' : 'buttonCancel.text')}
            </Button>
            <Button
              data-testid={ButtonDataTestId.Registration_Reserved_Stakes_Confirm_Slot}
              aria-label={dict(
                isEditingExistingSlot ? 'buttonConfirmEdit.aria' : 'buttonConfirm.aria'
              )}
              disabled={!formSlot.formState.isValid}
              onClick={formSlot.handleSubmit(handleSubmitSlot)}
            >
              {dict(isEditingExistingSlot ? 'buttonConfirmEdit.text' : 'buttonConfirm.text')}
            </Button>
          </form>
        </Form>
      </ReservedStakesTable>
      {!isNewSlotFormVisible ? (
        <Button
          data-testid={ButtonDataTestId.Registration_Reserved_Stakes_Confirm}
          aria-label={dictConfirm('aria')}
          disabled={formMulti.getFieldState('reservedContributors').invalid || isNewSlotFormVisible}
          onClick={formMulti.handleSubmit(handleSubmit)}
        >
          {dictConfirm('text')}
        </Button>
      ) : null}
    </div>
  );
}
