import { CollapsableContent } from '@/components/NodeCard';
import { NodeExitUnlockTimerNotification } from '@/components/StakedNode/Notification/NodeExitUnlockTimerNotification';

export type NodeCardUnlockTimerProps = {
  requestedUnlockDate: Date | null;
};

export function NodeCardUnlockTimer({ requestedUnlockDate }: NodeCardUnlockTimerProps) {
  return (
    <CollapsableContent className="text-warning" size="xs" forceExpanded>
      <NodeExitUnlockTimerNotification date={requestedUnlockDate} className="md:text-xs" />
    </CollapsableContent>
  );
}
