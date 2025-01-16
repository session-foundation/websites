import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { Loading } from '@session/ui/components/loading';
import { useTranslations } from 'next-intl';
import { OpenNodeCard } from '@/components/OpenNodeCard';

export function AlreadyRegisteredMultiTab() {
  const dictionary = useTranslations('actionModules.registration.alreadyRegisteredMulti');
  const { contract } = useRegistrationWizard();

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dictionary('specialTitle')} />
        <WizardSectionDescription description={dictionary('specialDescription')} />
      </div>
      {contract ? (
        <OpenNodeCard className="text-start" id={contract.address} contract={contract} forceSmall />
      ) : (
        // TODO: replace loading indicator with skeleton -- the user should never see the loading state, but its here just in case
        <Loading />
      )}
    </div>
  );
}
