import {
  type MultiRegistrationFormSchema,
  REGISTRATION_QUERY_PARAM,
  useRegistrationWizard,
} from '@/app/register/[nodeId]/Registration';
import { REG_MODE, REG_TAB } from '@/app/register/[nodeId]/types';
import EthereumAddressField from '@/components/Form/EthereumAddressField';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { Form, FormField } from '@session/ui/components/ui/form';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';

export function RewardsAddressInputMultiTab() {
  const { formMulti, changeTab, mode, setBackButtonClickCallback, pushQueryParam } =
    useRegistrationWizard();

  const dict = useTranslations('actionModules.shared');
  const dictConfirm = useTranslations('actionModules.registration.shared.buttonConfirm');

  const initialRewardsAddress = useRef<string>(formMulti.watch('rewardsAddress'));

  const handleBackButtonClick = () => {
    if (mode === REG_MODE.EDIT) {
      formMulti.setValue('rewardsAddress', initialRewardsAddress.current);
    }
  };

  const handleSubmit = (data: MultiRegistrationFormSchema) => {
    pushQueryParam(REGISTRATION_QUERY_PARAM.REWARDS_ADDRESS, data.rewardsAddress);
    // TODO: Implement the reserve slots
    // changeTab(mode === REG_MODE.EDIT ? REG_TAB.SUBMIT_MULTI : REG_TAB.RESERVE_SLOTS);
    changeTab(mode === REG_MODE.EDIT ? REG_TAB.SUBMIT_MULTI : REG_TAB.AUTO_ACTIVATE);
  };

  useEffect(() => {
    setBackButtonClickCallback(() => handleBackButtonClick);
    return () => setBackButtonClickCallback(null);
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <Form {...formMulti}>
        <form
          className="flex w-full flex-col gap-6"
          onSubmit={formMulti.handleSubmit(handleSubmit)}
        >
          <FormField
            control={formMulti.control}
            name="rewardsAddress"
            render={({ field }) => (
              <EthereumAddressField
                // @ts-expect-error -- TODO: type this
                field={field}
                label={dict('rewardsAddress')}
                tooltip={dict('rewardsAddressDescription')}
                dataTestId={InputDataTestId.Registration_Rewards_Address_Multi}
              />
            )}
          />
        </form>
      </Form>
      <Button
        data-testid={ButtonDataTestId.Registration_Rewards_Address_Input_Multi_Confirm}
        aria-label={dictConfirm('aria')}
        disabled={formMulti.getFieldState('rewardsAddress').invalid}
        onClick={formMulti.handleSubmit(handleSubmit)}
      >
        {dictConfirm('text')}
      </Button>
    </div>
  );
}
