import { ActionModuleRow } from '@/components/ActionModule';
import ActionModuleFeeRow from '@/components/ActionModuleFeeRow';
import { NodeContributorList } from '@/components/NodeCard';
import { formatSENTBigInt } from '@session/contracts/hooks/Token';
import type { Stake } from '@session/staking-api-js/schema';
import { PubKey } from '@session/ui/components/PubKey';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { LinkDataTestId } from '@/testing/data-test-ids';

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

  const formattedTotalStaked = useMemo(
    () => formatSENTBigInt(node.contributors.reduce((acc, { amount }) => acc + amount, 0n)),
    [node.contributors]
  );

  return (
    <div className="flex flex-col gap-4">
      <ActionModuleRow
        label={dictionaryActionModulesNode('contributors')}
        tooltip={dictionaryActionModulesNode('contributorsTooltip')}
      >
        <span className="flex flex-row flex-wrap items-center gap-2 align-middle">
          <NodeContributorList contributors={node.contributors} forceExpand showEmptySlots />
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
<<<<<<< HEAD
      {typeof feeEstimate !== 'undefined' ? (
        <ActionModuleRow
          label={feeEstimateText ?? dictionaryActionModulesNode('feeEstimate')}
          tooltip={dictionaryActionModulesNode.rich('feeEstimateTooltip', {
            link: externalLink({
              href: URL.GAS_INFO,
              dataTestId: LinkDataTestId.Fee_Gas_Info_Tooltip,
            }),
          })}
        >
          <span className="inline-flex flex-row items-center gap-1.5 align-middle">
            {feeEstimate ? (
              `${feeEstimate} ${TICKER.ETH}`
            ) : (
              <LoadingText className="mr-8 scale-x-75 scale-y-50" />
            )}
          </span>
        </ActionModuleRow>
      ) : null}
=======
>>>>>>> dev
      <ActionModuleRow
        label={dictionary('amountStaked')}
        tooltip={dictionary('amountStakedTooltip')}
      >
        {formattedTotalStaked}
      </ActionModuleRow>
      <ActionModuleFeeRow fee={fee} gasAmount={gasAmount} gasPrice={gasPrice} />
    </div>
  );
}
