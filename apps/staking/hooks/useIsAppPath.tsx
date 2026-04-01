import { APP_PATHS } from '@/lib/constants';
import { usePathname } from 'next/navigation';

export function useIsAppPath() {
  const pathname = usePathname();
  return APP_PATHS.some((path) => pathname.startsWith(path));
}
