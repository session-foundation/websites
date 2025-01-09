import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_TAB } from '@/app/register/[nodeId]/types';
import EthereumAddressField from '@/components/Form/EthereumAddressField';
import { ButtonDataTestId, InputDataTestId } from '@/testing/data-test-ids';
import { Form, FormField } from '@session/ui/components/ui/form';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';

export function RewardsAddressInputSoloTab() {
  const dictionary = useTranslations('actionModules.shared');
  const dictionaryConfirm = useTranslations('actionModules.registration.shared.buttonConfirm');
  const { formSolo, changeTab, setBackButtonClickCallback } = useRegistrationWizard();

  const initialRewardsAddress = useRef<string>(formSolo.watch('rewardsAddress'));

  const handleBackButtonClick = () => {
    formSolo.setValue('rewardsAddress', initialRewardsAddress.current);
  };

  useEffect(() => {
    setBackButtonClickCallback(() => handleBackButtonClick);
    return () => setBackButtonClickCallback(null);
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <Form {...formSolo}>
        <form className="flex w-full flex-col gap-6">
          <FormField
            control={formSolo.control}
            name="rewardsAddress"
            render={({ field }) => (
              <EthereumAddressField
                // @ts-expect-error -- TODO: type this
                field={field}
                label={dictionary('rewardsAddress')}
                tooltip={dictionary('rewardsAddressDescription')}
                dataTestId={InputDataTestId.Registration_Rewards_Address_Solo}
              />
            )}
          />
        </form>
      </Form>
      <Button
        data-testid={ButtonDataTestId.Registration_Rewards_Address_Input_Solo_Confirm}
        aria-label={dictionaryConfirm('aria')}
        disabled={!formSolo.formState.isValid}
        onClick={() => changeTab(REG_TAB.SUBMIT_SOLO)}
      >
        {dictionaryConfirm('text')}
      </Button>
    </div>
  );
}