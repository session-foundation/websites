import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_MODE, type REG_TAB } from '@/app/register/[nodeId]/types';
import { EditButton } from '@session/ui/components/EditButton';
import type { ButtonProps } from '@session/ui/ui/button';
import { Tooltip } from '@session/ui/ui/tooltip';
import { type MouseEvent, type ReactNode, forwardRef } from 'react';

type RegistrationEditButtonProps = ButtonProps & {
  tab: REG_TAB;
  iconClassName?: string;
  disabledReason?: ReactNode;
};

export const RegistrationEditButton = forwardRef<HTMLButtonElement, RegistrationEditButtonProps>(
  ({ tab, disabled, disabledReason, onClick, iconClassName, ...props }, ref) => {
    const { isSubmitting, isError, changeTab, setMode } = useRegistrationWizard();

    function handleClick(e: MouseEvent<HTMLButtonElement>) {
      onClick?.(e);
      changeTab(tab);
      setMode(REG_MODE.EDIT);
    }

    const button = (
      <EditButton
        ref={ref}
        {...props}
        iconClassName={iconClassName}
        disabled={isSubmitting || isError || disabled}
        onClick={handleClick}
      />
    );

    return disabled ? (
      <Tooltip tooltipContent={disabledReason}>
        <div>{button}</div>
      </Tooltip>
    ) : (
      button
    );
  }
);
