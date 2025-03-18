'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type RouterResetInputProps = {
  id: string;
  className?: string;
};

export default function RouterResetInput({ id, className }: RouterResetInputProps) {
  const pathname = usePathname();

  const setCheckboxToFalse = () => {
    const input = document.getElementById(id);
    if (input && 'checked' in input) {
      if (input.checked) {
        input.checked = false;
      }
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: This is fine
  useEffect(() => {
    setCheckboxToFalse();
  }, [pathname]);
  return <input id={id} type="checkbox" className={className} />;
}
