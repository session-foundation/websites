import OpenNodesModule from '@/app/stake/OpenNodesModule';
import ScreenContainer from '@/components/ScreenContainer';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ScreenContainer>
      <ModuleGrid size="lg" className="h-full px-4 md:auto-rows-auto md:px-10">
        <div className="col-span-1 h-full pb-8 md:mt-0 md:max-h-screen-without-header">
          {children}
        </div>
        <div className="col-span-2 mt-12 flex h-full flex-col gap-14 pb-8 md:mt-0 md:max-h-screen-without-header md:gap-6">
          <OpenNodesModule />
        </div>
      </ModuleGrid>
    </ScreenContainer>
  );
}
