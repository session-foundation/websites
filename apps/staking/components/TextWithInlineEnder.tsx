import { cn } from '@session/ui/lib/utils';
import { type ReactNode, useMemo } from 'react';

export function TextWithInlineEnder({
  text,
  ender,
  className,
}: {
  text: ReactNode;
  ender?: ReactNode;
  className?: string;
}) {
  const children = useMemo(() => {
    if (!ender) return text;

    let descriptionChild: ReactNode = text;
    let hrefLinkedWord: null | string = null;
    if (typeof text === 'string') {
      const wordsArray = text.trim().split(' ');

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
          {ender}
        </span>
      </>
    );
  }, [text, ender]);

  return <div className={cn('flex-wrap text-wrap', className)}>{children}</div>;
}
