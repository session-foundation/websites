import Typography from '@session/ui/components/Typography';
import { ArrowDownIcon } from '@session/ui/icons/ArrowDownIcon';
import { LinkOutIcon } from '@session/ui/icons/LinkOutIcon';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import Link from 'next/link';
import { type ReactNode, useMemo } from 'react';

type BackButtonProps = {
  text: string;
  aria: string;
  dataTestId: `button:${string}`;
  onClick: () => void;
  disabled?: boolean;
  hide?: boolean;
};

export function WizardTitle({
  title,
  backButton,
}: {
  title: ReactNode;
  backButton?: BackButtonProps;
}) {
  return (
    <Typography
      variant="h2"
      className="text-session-text relative mb-8 w-full text-lg font-medium md:text-xl"
    >
      {backButton && !backButton.hide ? (
        <Button
          size="collapse"
          variant="ghost"
          onClick={backButton.onClick}
          disabled={backButton.disabled ?? false}
          data-testid={backButton.dataTestId}
          aria-label={backButton.aria}
          className="absolute left-0 top-1/2 h-7 -translate-y-1/2 gap-1 px-1"
        >
          <ArrowDownIcon className="fill-session-text h-3 w-3 rotate-90" />
          <span className="hidden text-sm sm:inline-block">{backButton.text}</span>
        </Button>
      ) : null}
      {title}
    </Typography>
  );
}

export function WizardSectionTitle({ title }: { title: ReactNode }) {
  return (
    <Typography
      variant="h3"
      className="text-session-text relative w-full text-xl font-medium md:text-2xl"
    >
      {title}
    </Typography>
  );
}

export function WizardSectionDescription({
  description,
  href,
  className,
}: {
  description: ReactNode;
  href?: string;
  className?: string;
}) {
  const children = useMemo(() => {
    if (!href) return description;

    let descriptionChild: ReactNode | string = description;
    let hrefLinkedWord: null | string = null;
    if (typeof description === 'string') {
      const wordsArray = description.trim().split(' ');

      if (wordsArray.length > 1) {
        const lastWord = wordsArray.pop();
        descriptionChild = wordsArray.join(' ');
        if (lastWord) {
          hrefLinkedWord = lastWord;
        }
      }
    }

    return (
      <>
        <span>{descriptionChild}</span>
        <span className="ms-1 inline-flex gap-1.5 whitespace-nowrap">
          {hrefLinkedWord}
          <Link href={href} target="_blank" rel="noreferrer" className="group self-center">
            <LinkOutIcon className="stroke-session-green group-hover:stroke-session-green-dark h-3.5 w-3.5" />
          </Link>
        </span>
      </>
    );
  }, [description, href]);

  return (
    <Typography variant="p" className={cn('flex-wrap text-wrap text-xs md:text-sm', className)}>
      {children}
    </Typography>
  );
}

export function WizardContent({
  title,
  section,
  backButton,
  children,
}: {
  title?: ReactNode;
  section?: {
    title?: ReactNode;
    description?: ReactNode;
    description2?: ReactNode;
    href?: string;
  };
  backButton?: BackButtonProps;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full max-w-xl flex-col items-center gap-6 self-center text-center">
      {title ? <WizardTitle title={title} backButton={backButton} /> : null}
      {section?.title ? <WizardSectionTitle title={section.title} /> : null}
      {section?.description ? (
        <WizardSectionDescription
          description={section.description}
          href={section.description2 ? undefined : section.href}
        />
      ) : null}
      {section?.description2 ? (
        <WizardSectionDescription
          description={section.description2}
          href={section.href}
          className="-mt-5"
        />
      ) : null}
      <div className="flex h-max w-full flex-col justify-center pb-6">{children}</div>
    </div>
  );
}
