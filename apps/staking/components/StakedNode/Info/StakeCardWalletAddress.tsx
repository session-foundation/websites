import { CollapsableContent, type CollapsableContentProps, RowLabel } from '@/components/NodeCard';
import type { PubKeyProps } from '@session/ui/components/PubKey';
import { PubkeyWithEns } from '@session/wallet/components/PubkeyWithEns';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

export type StakeCardWalletAddressProps = CollapsableContentProps & {
  addressLabel: 'operatorAddress' | 'beneficiaryAddress';
  version?: string;
  isVersionOutOfDate?: boolean;
  address?: Address;
  pubkeyOptions?: Omit<PubKeyProps, 'pubKey'>;
};

export function StakeCardWalletAddress({
  forceExpanded,
  width,
  size,
  address,
  pubkeyOptions,
  addressLabel,
}: StakeCardWalletAddressProps) {
  const generalNodeDictionary = useTranslations('sessionNodes.general');

  const titleFormat = useTranslations('modules.title');
  return address ? (
    <CollapsableContent size={size} width={width} forceExpanded={forceExpanded}>
      <RowLabel>{titleFormat('format', { title: generalNodeDictionary(addressLabel) })}</RowLabel>
      <PubkeyWithEns expandOnHoverDesktopOnly {...pubkeyOptions} pubKey={address} />
    </CollapsableContent>
  ) : null;
}
