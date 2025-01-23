import {
  type MODULE_GRID_ALIGNMENT,
  ModuleGrid,
  ModuleGridContent,
  ModuleGridHeader,
  ModuleGridTitle,
} from '@session/ui/components/ModuleGrid';
import { QuestionIcon } from '@session/ui/icons/QuestionIcon';
import { cn } from '@session/ui/lib/utils';
import { Skeleton } from '@session/ui/ui/skeleton';
import { Tooltip } from '@session/ui/ui/tooltip';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@session/ui/ui/accordion';

type ActionModuleProps = {
  title?: ReactNode;
  children?: ReactNode;
  headerAction?: ReactNode;
  background?: keyof typeof actionModuleBackground;
  className?: string;
  contentClassName?: string;
  contentContainerClassName?: string;
  contentAlignment?: MODULE_GRID_ALIGNMENT;
  noHeader?: boolean;
};

export default function ActionModule({
  title,
  headerAction,
  background,
  children,
  className,
  contentClassName,
  contentContainerClassName,
  contentAlignment,
  noHeader,
}: ActionModuleProps) {
  return (
    <ModuleGrid variant="action" colSpan={1} className={cn('h-full w-full', className)}>
      {!noHeader ? (
        <ModuleGridHeader keepDesktopHeaderOnMobile>
          {title ? (
            <>
              <ModuleGridTitle>{title}</ModuleGridTitle>
              <div className="me-4">{headerAction}</div>
            </>
          ) : null}
        </ModuleGridHeader>
      ) : null}
      <ModuleGridContent
        className={contentClassName}
        containerClassName={contentContainerClassName}
        alignment={contentAlignment}
      >
        {children}
      </ModuleGridContent>
      <div
        className={cn(
          'absolute -z-10 h-full w-full bg-gradient-to-b from-[#0A0C0C] to-[#081512] opacity-70 bg-blend-lighten blur-lg xl:opacity-100 xl:blur-0'
        )}
        style={background ? actionModuleBackground[background] : undefined}
      />
    </ModuleGrid>
  );
}

export const actionModuleBackground = {
  1: {
    background: 'url(/images/action-module-background-1.png)',
    backgroundPositionX: '85%',
    backgroundPositionY: 'bottom',
    backgroundSize: '150%',
    backgroundRepeat: 'no-repeat',
  },
  2: {
    background: 'url(/images/action-module-background-2.png)',
    backgroundPositionX: '0%',
    backgroundPositionY: 'bottom',
    backgroundSize: '150%',
    backgroundRepeat: 'no-repeat',
  },
  3: {
    background: 'url(/images/action-module-background-3.png)',
    backgroundPositionX: '0%',
    backgroundPositionY: 'bottom',
    backgroundSize: '150%',
    backgroundRepeat: 'no-repeat',
  },
};

export const ActionModuleTooltip = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <Tooltip ref={ref} tooltipContent={children}>
      <div className={cn('cursor-pointer', className)} {...props}>
        <QuestionIcon className="fill-session-text h-3.5 w-3.5" />
      </div>
    </Tooltip>
  )
);
ActionModuleTooltip.displayName = 'ModuleTooltip';

type ActionModuleRowContentProps = {
  label: string;
  tooltip: ReactNode;
  children: ReactNode;
  containerClassName?: string;
};

const ActionModuleRowContent = ({
  label,
  tooltip,
  children,
  containerClassName,
}: ActionModuleRowContentProps) => (
  <div className="flex flex-row flex-wrap items-center justify-between w-full">
    <span className="inline-flex items-center gap-2 text-nowrap align-middle">
      {label}
      <ActionModuleTooltip>{tooltip}</ActionModuleTooltip>
    </span>
    <div className={cn('flex flex-row', containerClassName)}>{children}</div>
  </div>
);

type ActionModuleRowProps = ActionModuleRowContentProps & {
  last?: boolean;
};

export const ActionModuleRow = ({
  label,
  tooltip,
  children,
  containerClassName,
  last,
}: ActionModuleRowProps) => (
  <>
    <ActionModuleRowContent label={label} tooltip={tooltip} containerClassName={containerClassName}>
      {children}
    </ActionModuleRowContent>
    {!last ? <ActionModuleDivider /> : null}
  </>
);

export const ActionModuleAccordionRow = ({
  label,
  tooltip,
  children,
  containerClassName,
  accordionContent,
  last,
}: ActionModuleRowProps & {
  accordionContent: ReactNode;
}) => (
  <>
    <Accordion type="single" collapsible className="-my-4">
      <AccordionItem value="action-module-accordion-row" hideDivider>
        <AccordionTrigger className="font-normal">
          <ActionModuleRowContent
            label={label}
            tooltip={tooltip}
            containerClassName={containerClassName}
          >
            {children}
          </ActionModuleRowContent>
        </AccordionTrigger>
        <AccordionContent>{accordionContent}</AccordionContent>
      </AccordionItem>
    </Accordion>
    {!last ? <ActionModuleDivider /> : null}
  </>
);

export const ActionModuleRowSkeleton = () => (
  <>
    <div className="flex flex-row flex-wrap items-center justify-between">
      <Skeleton className="h-5 w-full max-w-32" />
      <Skeleton className="h-5 w-full max-w-48" />
    </div>
    <ActionModuleDivider />
  </>
);

export const ActionModuleDivider = ({ className }: { className?: string }) => (
  <div className={cn('bg-gray-dark h-px w-full', className)} />
);

export const ActionModulePage = ({ children, ...props }: ActionModuleProps) => (
  <ActionModule
    background={1}
    noHeader
    {...props}
    contentClassName="text-xl text-center px-6 md:px-16 gap-6"
    contentContainerClassName="min-h-52"
  >
    {children}
  </ActionModule>
);
