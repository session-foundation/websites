import { CollapsableContent, type CollapsableContentProps } from '@/components/NodeCard';
import { VERSION } from '@/hooks/useNetworkVersionInfo';
import { cn } from '@session/ui/lib/utils';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

export type NodeCardVersionProps = CollapsableContentProps & {
  version?: string;
  availableUpdate?: VERSION | null;
};

function getColorFromVersion(v?: VERSION | null) {
  switch (v) {
    case VERSION.MAJOR:
      return 'text-destructive';
    case VERSION.MINOR:
      return 'text-warning';
    case VERSION.PATCH:
      return 'text-indicator-blue';
    default:
      return 'text-gray-lightest';
  }
}

export function NodeCardVersion({ version, availableUpdate, ...props }: NodeCardVersionProps) {
  const dictionary = useTranslations('nodeCard.staked');

  return version ? (
    <CollapsableContent {...props}>
      <Tooltip
        tooltipContent={dictionary(
          availableUpdate === VERSION.UP_TO_DATE || availableUpdate === VERSION.UNKNOWN
            ? 'versionTooltipUpToDate'
            : availableUpdate === VERSION.PATCH
              ? 'versionTooltipPatch'
              : 'versionTooltipOutOfDate'
        )}
      >
        <span className={cn('font-normal', getColorFromVersion(availableUpdate))}>
          {dictionary('versionLabel', { version: `v${version}` })}
        </span>
      </Tooltip>
    </CollapsableContent>
  ) : null;
}
