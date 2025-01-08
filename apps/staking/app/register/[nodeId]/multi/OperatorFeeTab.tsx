import {
  type MultiRegistrationFormSchema,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { REG_MODE, REG_TAB } from '@/app/register/[nodeId]/types';
import OperatorFeeField from '@/components/Form/OperatorFeeField';
import { SESSION_NODE } from '@/lib/constants';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { Form, FormField } from '@session/ui/components/ui/form';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';

export function OperatorFeeTab() {
  const dictionaryConfirm = useTranslations('actionModules.registration.shared.buttonConfirm');
  const dictionaryContinue = useTranslations('actionModules.registration.shared.buttonContinue');
  const { formMulti, changeTab, mode, setBackButtonClickCallback, pushQueryParam } =
    useRegistrationWizard();

  const initial = useRef<string>(formMulti.watch('operatorFee'));

  const handleBackButtonClick = () => {
    if (mode === REG_MODE.EDIT) {
      formMulti.setValue('operatorFee', initial.current);
    }
  };

  const handleSubmit = (data: MultiRegistrationFormSchema) => {
    pushQueryParam('operatorFee', data.operatorFee);
    changeTab(
      mode === REG_MODE.EDIT || mode === REG_MODE.EXPRESS
        ? REG_TAB.SUBMIT_MULTI
        : REG_TAB.REWARDS_ADDRESS
    );
  };

  useEffect(() => {
    setBackButtonClickCallback(() => handleBackButtonClick);
    return () => setBackButtonClickCallback(null);
  }, []);

  const fieldStatus = formMulti.getFieldState('operatorFee');

  return (
    <div className="flex w-full flex-col gap-6">
      <Form {...formMulti}>
        <form
          className="flex w-full flex-col gap-6"
          onSubmit={formMulti.handleSubmit(handleSubmit)}
        >
          <FormField
            control={formMulti.control}
            name="operatorFee"
            render={({ field }) => (
              <OperatorFeeField
                // TODO: consider using an informed placeholder for the operator fee
                placeholder={'0'}
                minFee={SESSION_NODE.MIN_OPERATOR_FEE}
                maxFee={SESSION_NODE.MAX_OPERATOR_FEE}
                field={field}
                dataTestId={InputDataTestId.Registration_Operator_Fee}
              />
            )}
          />
        </form>
      </Form>
      <Button
        data-testid={ButtonDataTestId.Registration_Operator_Fee_Continue}
        aria-label={(mode === REG_MODE.EDIT ? dictionaryConfirm : dictionaryContinue)('aria')}
        disabled={fieldStatus.invalid || formMulti.watch('operatorFee') === ''}
        onClick={formMulti.handleSubmit(handleSubmit)}
      >
        {(mode === REG_MODE.EDIT ? dictionaryConfirm : dictionaryContinue)('text')}
      </Button>
    </div>
  );
}
