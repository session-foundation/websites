import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { Notice } from '@/components/Notice';
import { WizardSectionDescription } from '@/components/Wizard';
import { PREFERENCE } from '@/lib/constants';
import { ButtonDataTestId, CheckboxDataTestId } from '@/testing/data-test-ids';
import { useTranslations } from 'next-intl';

export function RegistrationNotice() {
  const dict = useTranslations('infoNotice');
  const { setAcceptedNotice } = useRegistrationWizard();

  return (
    <Notice
      onContinue={() => setAcceptedNotice(true)}
      dontShowAgainPreference={PREFERENCE.INFO_NOTICE_DONT_SHOW_REGISTER}
      confirmButtonDataTestId={ButtonDataTestId.Registration_Notice_Continue}
      dontShowAgainDataTestId={CheckboxDataTestId.Notice_Registration_Dont_Show_Again}
    >
      <WizardSectionDescription
        description={dict.rich('register', { linkOut: '' })}
        href="https://docs.getsession.org/"
      />
    </Notice>
  );
}
