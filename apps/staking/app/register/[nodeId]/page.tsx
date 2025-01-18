import ActionModule, { ActionModuleRowSkeleton } from '@/components/ActionModule';
import { Suspense, use } from 'react';
import NodeRegistration from './NodeRegistration';
import { MODULE_GRID_ALIGNMENT } from '@session/ui/components/ModuleGrid';
import { ButtonSkeleton } from '@session/ui/ui/button';

interface NodePageParams {
  params: Promise<{
    nodeId: string;
  }>;
}

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

export default function NodePage(props: NodePageParams) {
  const params = use(props.params);
  const { nodeId } = params;

  return (
    <ActionModule
      background={2}
      className="h-screen-without-header md:h-full"
      noHeader
      contentAlignment={MODULE_GRID_ALIGNMENT.TOP}
    >
      <Suspense fallback={<NodeRegistrationFormSkeleton />}>
        <NodeRegistration nodeId={nodeId} />
      </Suspense>
    </ActionModule>
  );
}
