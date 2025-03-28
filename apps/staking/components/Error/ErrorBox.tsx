'use client';

import { ButtonDataTestId } from '@/testing/data-test-ids';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import Typography from '@session/ui/components/Typography';
import { useTranslations } from 'next-intl';

export type ErrorBoxProps = {
  error: Error & { digest?: string };
};

export function ErrorBox({ error }: ErrorBoxProps) {
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
