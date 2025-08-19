import type { UseConfirmationProgressReturn } from '@/app/register/[nodeId]/solo/SubmitSoloTab';
import { BaseNodeNotificationText } from '@/components/StakedNode/Notification/BaseNodeNotificationText';
import { SESSION_NODE } from '@/lib/constants';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

export const NotificationJoiningNetwork = ({
  confirmations,
  remainingTimeEst,
}: UseConfirmationProgressReturn) => {
  const dictionary = useTranslations('nodeCard.staked');

  return remainingTimeEst ? (
    <Tooltip
      tooltipContent={dictionary.rich('joiningNetworkDescription', {
        confirmations,
        requiredConfirmations: SESSION_NODE.NETWORK_REQUIRED_CONFIRMATIONS,
      })}
    >
      <BaseNodeNotificationText level="info">
        {dictionary.rich('joiningNetworkNotification', { relativeTime: remainingTimeEst })}
      </BaseNodeNotificationText>
    </Tooltip>
  ) : null;
};
