import { BaseNodeNotificationText } from '@/components/StakedNode/Notification/BaseNodeNotificationText';
import { VERSION } from '@/hooks/useNetworkVersionInfo';
import { URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

export const NodeVersionUpdateAvailableNotification = ({
  availableUpdate,
  className,
}: {
  availableUpdate: VERSION;
  className?: string;
}) => {
  const dictionary = useTranslations('nodeCard.staked');

  return (
    <Tooltip
      tooltipContent={dictionary.rich('versionUpdateAvailableNotificationDescription', {
        link: externalLink(URL.SESSION_NODE_UPDATE_DOCS),
      })}
    >
      <BaseNodeNotificationText
        level={availableUpdate === VERSION.MAJOR ? 'error' : 'warning'}
        className={className}
      >
        {dictionary('versionUpdateAvailableNotification')}
      </BaseNodeNotificationText>
    </Tooltip>
  );
};
