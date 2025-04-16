import { InfoNodeCardSkeleton } from '@/components/InfoNodeCard';
import {
  MODULE_GRID_ALIGNMENT,
  ModuleGrid,
  ModuleGridContent,
  ModuleGridHeader,
  ModuleGridTitle,
} from '@session/ui/components/ModuleGrid';
import type { ReactNode } from 'react';

export function NodeListModuleContent({ children }: { children: ReactNode }) {
  return (
    <ModuleGridContent
      className="h-full pt-4 md:overflow-y-auto md:pt-0"
      alignment={MODULE_GRID_ALIGNMENT.TOP}
    >
      {children}
    </ModuleGridContent>
  );
}

export default function NodesListModule({
  title,
  children,
  headerItems,
}: {
  title: string;
  children: ReactNode;
  headerItems?: ReactNode;
}) {
  return (
    <ModuleGrid variant="section" colSpan={2} className="h-full">
      <ModuleGridHeader>
        <ModuleGridTitle>{title}</ModuleGridTitle>
        {headerItems}
      </ModuleGridHeader>
      <NodeListModuleContent>{children}</NodeListModuleContent>
    </ModuleGrid>
  );
}

export function NodesListSkeleton() {
  return (
    <>
      <InfoNodeCardSkeleton />
      <InfoNodeCardSkeleton />
      <InfoNodeCardSkeleton />
    </>
  );
}
