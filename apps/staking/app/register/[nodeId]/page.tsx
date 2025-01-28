import { useTranslations } from 'next-intl';
import ActionModule from '@/components/ActionModule';
import NodeRegistration from './NodeRegistration';
import { Suspense, use } from 'react';
import { NodeRegistrationFormSkeleton } from '@/app/register/[nodeId]/NodeRegistrationForm';

interface NodePageParams {
  params: Promise<{
    nodeId: string;
  }>;
}

export default function NodePage(props: NodePageParams) {
  const params = use(props.params);
  const { nodeId } = params;
  const dictionary = useTranslations('actionModules.register');

  return (
    <ActionModule
      background={2}
      title={dictionary('title')}
      className="h-screen-without-header md:h-full"
    >
      <Suspense fallback={<NodeRegistrationFormSkeleton />}>
        <NodeRegistration nodeId={nodeId} />
      </Suspense>
    </ActionModule>
  );
}
