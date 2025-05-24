import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { useTranslations } from 'next-intl';

export function ProblemContactSupport() {
  const dict = useTranslations('actionModules.registration.problemContactSupport');
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dict('specialTitle')} />
        <WizardSectionDescription description={dict.rich('specialDescription')} />
      </div>
    </div>
  );
}
