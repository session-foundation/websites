import { CollapsableContent, type CollapsableContentProps, RowLabel } from '@/components/NodeCard';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { useTranslations } from 'next-intl';

export type StakeCardTextProps = CollapsableContentProps & {
  label: string;
  content: string;
  hideCopyToClipboardButton?: boolean;
};

export function StakeCardText({
  forceExpanded,
  width,
  size,
  label,
  content,
  hideCopyToClipboardButton,
}: StakeCardTextProps) {
  const titleFormat = useTranslations('modules.title');
  return (
    <CollapsableContent size={size} width={width} forceExpanded={forceExpanded}>
      <RowLabel>{titleFormat('format', { title: label })}</RowLabel>
      {content}
      {!hideCopyToClipboardButton ? (
        <CopyToClipboardButton
          textToCopy={content}
          data-testid={ButtonDataTestId.Staked_Node_Copy_Staked_Balance}
        />
      ) : null}
    </CollapsableContent>
  );
}
