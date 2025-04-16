import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { ErrorBox, type ErrorBoxProps } from '@/components/Error/ErrorBox';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { SOCIALS } from '@/lib/constants';
import { Social } from '@session/ui/components/SocialLinkList';
import type { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export const recoverableErrors = new Set([
  /** User can just not reject the request */
  'UserRejectedRequest',
  /** Retry */
  'SafeERC20FailedOperation',
  /** Max registrations exceeded, can try again after the next block */
  'MaxPubkeyAggregationsExceeded',
  /** The connected wallet failed */
  'InternalRpc',
]);

// NOTE: this is here to keep track of known errors so we can move them to recoverable if needed
// export const unrecoverableErrors = new Set([
//   'BLSPubkeyAlreadyExists',
//   'MaxContributorsExceeded',
//   'ContributionTotalMismatch',
//   'InvalidBLSProofOfPossession',
// ]);

export type ErrorTabProps = ErrorBoxProps & {
  dict: ReturnType<typeof useTranslations<'actionModules.registration.errorMulti'>>;
};

export function ErrorTabRegistration({ error, dict }: ErrorTabProps) {
  const { setIsError, setIsSubmitting, isSubmitting } = useRegistrationWizard();

  // biome-ignore lint/correctness/useExhaustiveDependencies: We don't care about the setters changing
  useEffect(() => {
    setIsError(true);
    if (isSubmitting) {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return <ErrorTab error={error} dict={dict} />;
}

export function ErrorTab({ error, dict }: ErrorTabProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <WizardSectionTitle title={dict('specialTitle')} />
        <WizardSectionDescription
          description={dict.rich('specialDescription')}
          href={SOCIALS[Social.Discord].link}
        />
      </div>
      <ErrorBox error={error} />
    </div>
  );
}
