import ActionModule from '@/components/ActionModule';
import { Suspense, use } from 'react';
import NodeRegistration from './NodeRegistration';
import { MODULE_GRID_ALIGNMENT } from '@session/ui/components/ModuleGrid';
import { NodeRegistrationFormSkeleton } from '@/app/register/[nodeId]/NodeRegistrationFormSkeleton';

interface NodePageParams {
  params: Promise<{
    nodeId: string;
  }>;
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
