import { Notice } from '@/components/Notice';
import { WizardSectionDescription } from '@/components/Wizard';
import {
  PREFERENCE,
  SESSION_NODE_SMALL_CONTRIBUTOR_AMOUNT,
  SESSION_NODE_TIME_STATIC,
} from '@/lib/constants';
import { formatLocalizedTimeFromSeconds } from '@/lib/locale-client';
import { ButtonDataTestId, CheckboxDataTestId } from '@/testing/data-test-ids';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import { useTranslations } from 'next-intl';

export function StakeNotice({
  onContinue,
  onCancel,
  topUp,
  stakeAmount,
}: { onContinue: () => void; onCancel: () => void; topUp?: boolean; stakeAmount?: bigint }) {
  const dict = useTranslations('infoNotice');
  const isSmallContributor = !!(stakeAmount && stakeAmount < SESSION_NODE_SMALL_CONTRIBUTOR_AMOUNT);

  return (
    <Notice
      onContinue={onContinue}
      onCancel={onCancel}
      dontShowAgainPreference={
        topUp
          ? PREFERENCE.INFO_NOTICE_DONT_SHOW_STAKE_TOP_UP
          : PREFERENCE.INFO_NOTICE_DONT_SHOW_STAKE
      }
      confirmButtonDataTestId={ButtonDataTestId.Stake_Notice_Continue}
      cancelButtonDataTestId={ButtonDataTestId.Stake_Notice_Cancel}
      dontShowAgainDataTestId={CheckboxDataTestId.Notice_Staking_Dont_Show_Again}
    >
      <WizardSectionDescription
        description={dict.rich('stake', { linkOut: '' })}
        href="https://docs.getsession.org"
      />
      {isSmallContributor ? (
        <WizardSectionDescription
          description={dict.rich('stakeSmallWarning', {
            linkOut: '',
            smallContributorLeaveRequestDelay: formatLocalizedTimeFromSeconds(
              SESSION_NODE_TIME_STATIC.SMALL_CONTRIBUTOR_EXIT_REQUEST_WAIT_TIME_SECONDS
            ),
            amount: formatSENTBigInt(SESSION_NODE_SMALL_CONTRIBUTOR_AMOUNT, 0),
          })}
          href="https://docs.getsession.org/"
        />
      ) : null}
    </Notice>
  );
}
