import { useFinalizeContract } from '@session/contracts/hooks/ServiceNodeContribution';
import type { Address } from 'viem';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { useTranslations } from 'next-intl';

export function ContractStartButton({ contractAddress }: { contractAddress: Address }) {
  const dict = useTranslations('nodeCard.staked.finalize');
  const { finalizeContract, contractCallStatus } = useFinalizeContract({ contractAddress });

  const isLoading = contractCallStatus !== 'pending';
  const isDisabled = contractCallStatus !== 'idle';

  return (
    <Button
      size="xs"
      disabled={isDisabled}
      onClick={() => finalizeContract()}
      data-testid={ButtonDataTestId.Staked_Node_Start}
    >
      {isLoading ? '...' : dict('buttonText')}
    </Button>
  );
}
