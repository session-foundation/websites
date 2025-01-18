import {
  REGISTRATION_QUERY_PARAM,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { REG_MODE, REG_TAB } from '@/app/register/[nodeId]/types';
import StakeAmountField from '@/components/Form/StakeAmountField';
import {
  SESSION_NODE_FULL_STAKE_AMOUNT,
  SESSION_NODE_MIN_STAKE_MULTI_OPERATOR,
} from '@/lib/constants';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { Form, FormField } from '@session/ui/components/ui/form';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';

const FIELD_NAME = 'stakeAmount';

export function StakeAmountTab() {
  const dictionaryConfirm = useTranslations('actionModules.registration.shared.buttonConfirm');
  const dictionaryContinue = useTranslations('actionModules.registration.shared.buttonContinue');
  const { formMulti, changeTab, mode, setBackButtonClickCallback, pushQueryParam } =
    useRegistrationWizard();

  const stakeAmount = formMulti.watch(FIELD_NAME);
  const initial = useRef<string>(stakeAmount);

  const handleBackButtonClick = () => {
    if (mode === REG_MODE.EDIT) {
      formMulti.setValue(FIELD_NAME, initial.current);
    }
  };

  /**
   * This handleSubmit function isn't a real form submit, it's just a way to
   * update the query params and navigate to the next tab. Because it isn't
   * a real form submit, the stakeAmount value must be fetched and live validation
   * state checked. This mimics the form submit behaviour but only for the stakeAmount field.
   */
  const handleSubmit = () => {
    if (formMulti.getFieldState(FIELD_NAME).invalid) return;

    pushQueryParam(REGISTRATION_QUERY_PARAM.STAKE_AMOUNT, stakeAmount);
    changeTab(mode === REG_MODE.EDIT ? REG_TAB.SUBMIT_MULTI : REG_TAB.OPERATOR_FEE);
  };

  useEffect(() => {
    setBackButtonClickCallback(() => handleBackButtonClick);
    return () => setBackButtonClickCallback(null);
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <Form {...formMulti}>
        <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
          <FormField
            control={formMulti.control}
            name={FIELD_NAME}
            render={({ field }) => (
              <StakeAmountField
                minStake={SESSION_NODE_MIN_STAKE_MULTI_OPERATOR}
                maxStake={SESSION_NODE_FULL_STAKE_AMOUNT}
                watchedStakeAmount={stakeAmount}
                field={field}
                dataTestId={InputDataTestId.Registration_Stake_Amount}
                dataTestIds={{
                  buttonMin: ButtonDataTestId.Registration_Stake_Amount_Min,
                  buttonMax: ButtonDataTestId.Registration_Stake_Amount_Max,
                  slider0: ButtonDataTestId.Registration_Stake_Amount_Slider_0,
                  slider25: ButtonDataTestId.Registration_Stake_Amount_Slider_25,
                  slider50: ButtonDataTestId.Registration_Stake_Amount_Slider_50,
                  slider75: ButtonDataTestId.Registration_Stake_Amount_Slider_75,
                  slider100: ButtonDataTestId.Registration_Stake_Amount_Slider_100,
                  sliderMin: ButtonDataTestId.Registration_Stake_Amount_Slider_Min,
                  sliderMax: ButtonDataTestId.Registration_Stake_Amount_Slider_Max,
                }}
              />
            )}
          />
        </form>
      </Form>
      <Button
        data-testid={ButtonDataTestId.Registration_Stake_Amount_Continue}
        aria-label={(mode === REG_MODE.EDIT ? dictionaryConfirm : dictionaryContinue)('aria')}
        disabled={formMulti.getFieldState(FIELD_NAME).invalid}
        onClick={handleSubmit}
      >
        {(mode === REG_MODE.EDIT ? dictionaryConfirm : dictionaryContinue)('text')}
      </Button>
    </div>
  );
}
