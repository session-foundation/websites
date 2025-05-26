'use client';

import { useRegistrationList } from '@/app/register/RegistrationListProvider';
import { Switch } from '@session/ui/ui/switch';

export function NodeRegistrationEditSwitch() {
  const { editing, setEditing } = useRegistrationList();

  return (
    <span className="mr-4 flex flex-row items-center gap-2">
      Edit
      <Switch checked={editing} onCheckedChange={(checked) => setEditing(checked)} />
    </span>
  );
}
