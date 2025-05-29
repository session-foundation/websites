import type { GenericModuleProps } from '@/app/mystakes/modules/types';
import { ModuleDynamicQueryText } from '@/components/ModuleDynamic';
import type { QUERY_STATUS } from '@/lib/query';
import { Module, ModuleTitleDynamic, ModuleTooltip } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export type DynamicModuleCardProps = GenericModuleProps & {
  titleLong: string;
  status: QUERY_STATUS;
  tooltipContent?: ReactNode;
  titleShort?: string;
  fallback?: ReactNode;
  enabled?: boolean;
  refetch: () => Promise<unknown>;
};

export default function DynamicModuleCard({
  size,
  variant,
  tooltipContent,
  titleLong,
  titleShort,
  fallback,
  status,
  enabled,
  refetch,
  children,
}: DynamicModuleCardProps) {
  const dictShared = useTranslations('modules.shared');
  const dictToast = useTranslations('modules.toast');
  const titleFormat = useTranslations('modules.title');

  return (
    <Module size={size} variant={variant}>
      {tooltipContent ? <ModuleTooltip>{tooltipContent}</ModuleTooltip> : null}
      <ModuleTitleDynamic
        longText={titleFormat('format', { title: titleLong })}
        shortText={titleShort ? titleFormat('format', { title: titleShort }) : undefined}
      />
      <ModuleDynamicQueryText
        status={status as QUERY_STATUS}
        fallback={fallback ?? 0}
        enabled={enabled}
        isLarge={size === 'lg'}
        errorFallback={dictShared('error')}
        errorToast={{
          messages: {
            error: dictToast('error', { module: titleLong }),
            refetching: dictToast('refetching'),
            success: dictToast('refetchSuccess', { module: titleLong }),
          },
          refetch,
        }}
      >
        {children}
      </ModuleDynamicQueryText>
    </Module>
  );
}
