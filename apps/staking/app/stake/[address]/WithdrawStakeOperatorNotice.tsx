import { Notice } from '@/components/Notice';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { useTranslations } from 'next-intl';

export function WithdrawStakeOperatorNotice({ onContinue }: { onContinue: () => void }) {
  const dict = useTranslations('infoNotice');

  return (
    <Notice
      onContinue={onContinue}
      confirmButtonDataTestId={ButtonDataTestId.Unstake_Operator_Notice_Continue}
      confirmButtonVariant="destructive"
      confirmButtonText={dict('withdrawOperator.confirm')}
    >
      {dict.rich('withdrawOperator.text')}
    </Notice>
  );
}
