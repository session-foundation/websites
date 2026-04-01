import { useConfirmationProgress } from '@/app/register/[nodeId]/solo/SubmitSoloTab';
import { ContractStartButton } from '@/components/StakedNode/ContractStartButton';
import { ContractAlreadyRunningNotification } from '@/components/StakedNode/Notification/ContractAlreadyRunningNotification';
import { NotificationJoiningNetwork } from '@/components/StakedNode/Notification/NotificationJoiningNetwork';
import { STAKE_CONTRACT_STATE } from '@/components/StakedNode/state';
import { useNodesWithConfirmations } from '@/lib/volatile-storage';
import type {
  ContributionContract,
  ContributionContractNotReady,
} from '@session/staking-api-js/schema';
import { areEd25519KeysEqual } from '@session/util-crypto/string';
import { useMemo } from 'react';

type ContractSummaryProps = {
  contract: ContributionContract | ContributionContractNotReady;
  isOperator?: boolean;
  state: STAKE_CONTRACT_STATE;
  showAlreadyRunningWarning?: boolean;
};

export function ContractSummary({
  contract,
  state,
  isOperator,
  showAlreadyRunningWarning,
}: ContractSummaryProps) {
  const {
    nodes: { nodesConfirmingRegistration },
  } = useNodesWithConfirmations();

  const estimateConfirmationTime = useMemo(() => {
    const node = nodesConfirmingRegistration.find((m) =>
      areEd25519KeysEqual(m.pubkeyEd25519, contract.service_node_pubkey)
    );
    if (!node) return null;
    return node.estimatedConfirmationTimestampMs;
  }, [contract, nodesConfirmingRegistration]);

  const confirmationProgress = useConfirmationProgress(estimateConfirmationTime);

  if (state === STAKE_CONTRACT_STATE.AWAITING_OPERATOR_ACTIVATION) {
    return isOperator ? <ContractStartButton contractAddress={contract.address} /> : null;
  }

  if (state === STAKE_CONTRACT_STATE.JOINING) {
    return (
      <NotificationJoiningNetwork
        confirmations={confirmationProgress.confirmations}
        enabled={confirmationProgress.enabled}
        remainingTimeEst={confirmationProgress.remainingTimeEst}
      />
    );
  }

  if (state === STAKE_CONTRACT_STATE.AWAITING_CONTRIBUTORS && showAlreadyRunningWarning) {
    return <ContractAlreadyRunningNotification />;
  }

  return null;
}
