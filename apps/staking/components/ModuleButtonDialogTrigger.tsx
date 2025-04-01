'use client';

import {
  ButtonModule,
  type ButtonModuleProps,
  ModuleContent,
  ModuleText,
} from '@session/ui/components/Module';
import { PresentIcon } from '@session/ui/icons/PresentIcon';
import { cn } from '@session/ui/lib/utils';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@session/ui/ui/alert-dialog';
import type { ReactNode } from 'react';

export type ModuleButtonDialogTriggerProps = ButtonModuleProps & {
  label?: string;
  dialogTitle?: string;
  textClassName?: string;
  IconComp?: typeof PresentIcon;
  iconStrokeForFill?: boolean;
  dialogContent?: ReactNode;
};

export default function ModuleButtonDialogTrigger({
  label,
  dialogTitle,
  textClassName,
  IconComp,
  iconStrokeForFill,
  disabled,
  dialogContent,
  'data-testid': dataTestId,
}: ModuleButtonDialogTriggerProps) {
  const Icon = IconComp ?? PresentIcon;
  const iconFillClassName = disabled
    ? iconStrokeForFill
      ? 'stroke-session-text'
      : 'fill-session-text'
    : iconStrokeForFill
      ? 'stroke-session-green group-hover:stroke-session-black'
      : 'fill-session-green group-hover:fill-session-black';

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <ButtonModule
          data-testid={dataTestId}
          className="group items-center transition-all duration-300 motion-reduce:transition-none"
          disabled={disabled}
        >
          <ModuleContent className="flex h-full select-none flex-row items-center gap-2 p-0 align-middle font-bold">
            <ModuleText
              className={cn(
                'inline-flex items-center gap-1.5 align-middle transition-all duration-300 motion-reduce:transition-none',
                disabled
                  ? 'opacity-50'
                  : 'text-session-green transition-all duration-300 group-hover:text-session-black motion-reduce:transition-none'
              )}
            >
              <Icon
                className={cn(
                  'mb-1 h-7 w-7 transition-all duration-300 motion-reduce:transition-none',
                  disabled && 'opacity-50',
                  iconFillClassName
                )}
              />
              <span className={cn('whitespace-normal text-3xl', textClassName)}>{label}</span>
            </ModuleText>
          </ModuleContent>
        </ButtonModule>
      </AlertDialogTrigger>
      <AlertDialogContent dialogTitle={dialogTitle}>{dialogContent}</AlertDialogContent>
    </AlertDialog>
  );
}
