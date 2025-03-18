import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { WizardSectionDescription, WizardSectionTitle } from '@/components/Wizard';
import { SOCIALS } from '@/lib/constants';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { Social } from '@session/ui/components/SocialLinkList';
import Typography from '@session/ui/components/Typography';
import { useTranslations } from 'next-intl';
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

export type ErrorBoxProps = {
  error: Error & { digest?: string };
};

function ErrorBox({ error }: ErrorBoxProps) {
  const dictionary = useTranslations('actionModules.registration.shared.error');

  const text = error.digest ?? error.message;
  return (
    <div className="flex h-full w-full flex-col items-center gap-2 pb-12">
      <div className="flex w-max flex-row items-center gap-1 self-start">
        <Typography variant="h4" className="text-start text-destructive">
          {dictionary('errorMessage')}
        </Typography>
        <CopyToClipboardButton
          textToCopy={text}
          aria-label={dictionary('copyToClipboardButtonAria')}
          data-testid={ButtonDataTestId.Registration_Error_Copy_To_Clipboard}
        />
      </div>
      <Typography
        variant="p"
        className="h-full w-full whitespace-break-spaces break-words rounded-md border-2 border-[#668C83] bg-session-black p-4 text-start font-medium text-destructive text-xs md:text-sm"
      >
        {text}
      </Typography>
    </div>
  );
}
