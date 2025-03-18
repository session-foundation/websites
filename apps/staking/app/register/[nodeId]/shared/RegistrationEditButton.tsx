import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_MODE, type REG_TAB } from '@/app/register/[nodeId]/types';
import { EditButton } from '@session/ui/components/EditButton';
import type { ButtonProps } from '@session/ui/ui/button';
import { type MouseEvent, forwardRef } from 'react';

export const RegistrationEditButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    tab: REG_TAB;
    iconClassName?: string;
  }
>(({ tab, disabled, onClick, iconClassName, ...props }, ref) => {
  const { isSubmitting, isError, changeTab, setMode } = useRegistrationWizard();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    onClick?.(e);
    changeTab(tab);
    setMode(REG_MODE.EDIT);
  }

  return (
    <EditButton
      ref={ref}
      {...props}
      iconClassName={iconClassName}
      disabled={isSubmitting || isError || disabled}
      onClick={handleClick}
    />
  );
});
