import { cn } from '@session/ui/lib/utils';
import { type ReactNode, useMemo } from 'react';

/**
 * Displays text with an optional ender. This `ender` is linked to the final word of
 * the text. This can be used for adding a component to the end of a sentence.
 * @param text - The text to display.
 * @param ender - The ender to display.
 * @param className - The class name to apply to the component.
 */
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
    let linkedEnderWord: null | string = null;
    if (typeof text === 'string') {
      const wordsArray = text.trim().split(' ');

      if (wordsArray.length > 1) {
        const lastWord = wordsArray.pop();
        descriptionChild = wordsArray.join(' ');
        if (lastWord) {
          linkedEnderWord = lastWord;
        }
      }
    }

    return (
      <>
        <span>{descriptionChild}</span>
        <span className="ms-1 inline-flex gap-1.5 whitespace-nowrap">
          {linkedEnderWord}
          {ender}
        </span>
      </>
    );
  }, [text, ender]);

  return <div className={cn('flex-wrap text-wrap', className)}>{children}</div>;
}
