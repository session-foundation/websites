import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_MODE, REG_TAB } from '@/app/register/[nodeId]/types';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';

export function AutoActivateTab() {
  const dictionary = useTranslations('actionModules.registration.autoActivate');
  const { mode, changeTab, formMulti, setBackButtonClickCallback, pushQueryParam } =
    useRegistrationWizard();

  const initial = useRef<boolean>(formMulti.watch('autoActivate'));

  const handleBackButtonClick = () => {
    if (mode === REG_MODE.EDIT) {
      formMulti.setValue('autoActivate', initial.current);
    }
  };

  const handleSubmit = (autoActivate: boolean) => {
    formMulti.setValue('autoActivate', autoActivate);
    pushQueryParam('autoActivate', autoActivate ? 'true' : 'false');
    changeTab(REG_TAB.SUBMIT_MULTI);
  };

  useEffect(() => {
    setBackButtonClickCallback(() => handleBackButtonClick);
    return () => setBackButtonClickCallback(null);
  }, []);

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        data-testid={ButtonDataTestId.Registration_Auto_Activate_Automatic}
        aria-label={dictionary('buttonAutomatic.aria')}
        onClick={() => handleSubmit(true)}
      >
        {dictionary('buttonAutomatic.text')}
      </Button>
      <Button
        data-testid={ButtonDataTestId.Registration_Auto_Activate_Manual}
        aria-label={dictionary('buttonManual.aria')}
        onClick={() => handleSubmit(false)}
      >
        {dictionary('buttonManual.text')}
      </Button>
    </div>
  );
}
