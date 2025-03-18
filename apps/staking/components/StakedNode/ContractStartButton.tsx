import { ButtonDataTestId } from '@/testing/data-test-ids';
import { useFinalizeContract } from '@session/contracts/hooks/ServiceNodeContribution';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

export function ContractStartButton({ contractAddress }: { contractAddress: Address }) {
  const dict = useTranslations('nodeCard.staked.finalize');
  const { finalizeContract, contractCallStatus } = useFinalizeContract({ contractAddress });

  return (
    <Button
      size="xs"
      disabled={contractCallStatus === 'pending' || contractCallStatus === 'success'}
      onClick={() => finalizeContract()}
      data-testid={ButtonDataTestId.Staked_Node_Start}
    >
      {contractCallStatus === 'pending' ? '...' : dict('buttonText')}
    </Button>
  );
}
