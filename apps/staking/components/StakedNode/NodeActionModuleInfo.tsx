import { ActionModuleRow } from '@/components/ActionModule';
import { NodeContributorList } from '@/components/NodeCard';
import { PubKey } from '@session/ui/components/PubKey';
import { externalLink } from '@/lib/locale-defaults';
import { HANDRAIL_THRESHOLD_DYNAMIC, SIGNIFICANT_FIGURES, URL } from '@/lib/constants';
import { LoadingText } from '@session/ui/components/loading-text';
import { useTranslations } from 'next-intl';
import type { Stake } from '@session/staking-api-js/client';
import { formattedTotalStakedInContract } from '@/lib/contracts';
import { useNetworkFeeFormula } from '@/hooks/useNetworkFeeFormula';
import { AlertTooltip } from '@session/ui/ui/tooltip';
import { useWallet } from '@session/wallet/hooks/useWallet';

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
  const dictionaryFee = useTranslations('fee');
  const dictionaryActionModulesNode = useTranslations('actionModules.node');
  const sessionNodeDictionary = useTranslations('sessionNodes.general');

  const { chainId } = useWallet();

  const { feeFormatted: feeEstimate, formula: feeFormula } = useNetworkFeeFormula({
    fee,
    gasAmount,
    gasPrice,
    maximumSignificantDigits: SIGNIFICANT_FIGURES.GAS_FEE_TOTAL,
  });

  const gasHighShowTooltip = !!(
    gasPrice && gasPrice > HANDRAIL_THRESHOLD_DYNAMIC(chainId).GAS_PRICE
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
      <ActionModuleRow
        label={dictionary('amountStaked')}
        tooltip={dictionary('amountStakedTooltip')}
      >
        {formattedTotalStakedInContract(node.contributors)}
      </ActionModuleRow>
      {typeof feeEstimate !== 'undefined' ? (
        <ActionModuleRow
          label={dictionaryFee('networkFee')}
          tooltip={dictionaryFee.rich('networkFeeTooltipWithFormula', {
            link: externalLink(URL.GAS_INFO),
            formula: () => feeFormula,
          })}
        >
          <span className="inline-flex flex-row items-center gap-1.5 align-middle">
            {gasHighShowTooltip ? (
              <AlertTooltip
                tooltipContent={dictionaryFee.rich('gasHigh', { link: externalLink(URL.GAS_INFO) })}
              />
            ) : null}
            {feeEstimate ? feeEstimate : <LoadingText className="mr-8 scale-x-75 scale-y-50" />}
          </span>
        </ActionModuleRow>
      ) : null}
    </div>
  );
}
