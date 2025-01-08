import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import { REG_MODE, type REG_TAB } from '@/app/register/[nodeId]/types';
import { EditButton, type EditButtonProps } from '@session/ui/components/EditButton';
import { forwardRef } from 'react';

export const RegistrationEditButton = forwardRef<
  HTMLButtonElement,
  EditButtonProps & { tab: REG_TAB }
>(({ tab, ...props }, ref) => {
  const { isSubmitting, isError, changeTab, setMode } = useRegistrationWizard();

  function handleClick() {
    changeTab(tab);
    setMode(REG_MODE.EDIT);
  }

  return (
    <EditButton ref={ref} {...props} disabled={isSubmitting || isError} onClick={handleClick} />
  );
});
