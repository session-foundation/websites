import { ActionModuleRowSkeleton } from '@/components/ActionModule';
import { ButtonSkeleton } from '@session/ui/ui/button';

export function NodeRegistrationFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ActionModuleRowSkeleton />
      <ButtonSkeleton rounded="lg" size="lg" />
    </div>
  );
}
