import { BaseNodeNotificationText } from '@/components/StakedNode/Notification/BaseNodeNotificationText';
import { Tooltip } from '@session/ui/ui/tooltip';
import { useTranslations } from 'next-intl';

export function ContractAlreadyRunningNotification() {
  const openDictionary = useTranslations('nodeCard.open');
  return (
    <Tooltip tooltipContent={openDictionary('errorStakedButAlreadyRunning')}>
      <BaseNodeNotificationText level="error">
        {openDictionary('errorStakedButAlreadyRunningNotification')}
      </BaseNodeNotificationText>
    </Tooltip>
  );
}
