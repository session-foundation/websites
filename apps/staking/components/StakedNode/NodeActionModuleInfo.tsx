import { ActionModuleRow } from '@/components/ActionModule';
import ActionModuleFeeRow from '@/components/ActionModuleFeeRow';
import { NodeContributorList } from '@/components/NodeCard';
import { getTotalStakedAmountForAddressFormatted } from '@/components/getTotalStakedAmountForAddressFormatted';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import type { Stake } from '@session/staking-api-js/schema';
import { PubKey } from '@session/ui/components/PubKey';
import { useTranslations } from 'next-intl';

export default function NodeActionModuleInfo({
  node,
  fee,
  gasAmount,
  gasPrice,
}: {
  node: Stake;
  fee: bigint | null;
  gasAmount: bigint | null;
  gasPrice: bigint | null;
}) {
  const dictionary = useTranslations('nodeCard.staked.requestExit.dialog.write');
  const dictionaryActionModulesNode = useTranslations('actionModules.node');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');
  const address = useCurrentActor();
  const amountStakedFormatted = getTotalStakedAmountForAddressFormatted(node.contributors, address);

  return (
    <div className="flex flex-col gap-4">
      <ActionModuleRow
        label={dictionaryActionModulesNode('contributors')}
        tooltip={dictionaryActionModulesNode('contributorsTooltip')}
      >
        <span className="flex flex-row flex-wrap items-center gap-2 align-middle">
          <NodeContributorList
            contributors={node.contributors}
            operatorAddress={node.operator_address}
            forceExpand
          />
        </span>
      </ActionModuleRow>
      <ActionModuleRow
        label={sessionNodeDictionary('publicKeyShort')}
        tooltip={sessionNodeDictionary('publicKeyDescription')}
      >
        <PubKey pubKey={node.service_node_pubkey} force="collapse" alwaysShowCopyButton />
      </ActionModuleRow>
      <ActionModuleRow
        label={sessionNodeDictionary('operatorAddress')}
        tooltip={sessionNodeDictionary('operatorAddressTooltip')}
      >
        <PubKey pubKey={node.operator_address} force="collapse" alwaysShowCopyButton />
      </ActionModuleRow>
      <ActionModuleRow
        label={dictionary('amountStaked')}
        tooltip={dictionary('amountStakedTooltip')}
      >
        {amountStakedFormatted}
      </ActionModuleRow>
      <ActionModuleFeeRow fee={fee} gasAmount={gasAmount} gasPrice={gasPrice} />
    </div>
  );
}
