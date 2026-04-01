import { NodeCardText, RowLabel } from '@/components/NodeCard';
import { NodeOperatorIndicator } from '@/components/StakedNodeCard';
import { PubKey, type PubKeyProps } from '@session/ui/components/PubKey';
import { cn } from '@session/ui/lib/utils';
import { type Ed25519PublicKey, isEd25519PublicKey } from '@session/util-crypto/keys';
import { useTranslations } from 'next-intl';

export type CardSnKeyProps = {
  pubkey: Ed25519PublicKey;
  isOperator?: boolean;
  width?: 'w-full' | 'w-max';
  tooltipSide?: PubKeyProps['side'];
};

export function StakeCardSnKey({ pubkey, isOperator, width, tooltipSide }: CardSnKeyProps) {
  const generalNodeDictionary = useTranslations('sessionNodes.general');
  const titleFormat = useTranslations('modules.title');

  return (
    <NodeCardText
      className={cn(
        'flex flex-row flex-wrap gap-1 peer-checked:mt-1 peer-checked:[&>.separator]:opacity-0 md:peer-checked:[&>.separator]:opacity-100 peer-checked:[&>span>span>button]:opacity-100 peer-checked:[&>span>span>div]:block peer-checked:[&>span>span>span]:hidden',
        width
      )}
    >
      {pubkey && isEd25519PublicKey(pubkey) ? (
        <span className="inline-flex flex-nowrap gap-1">
          {isOperator ? (
            <NodeOperatorIndicator className="me-0.5" isConnectedWallet={isOperator} />
          ) : null}
          <RowLabel className="self-center">
            {titleFormat('format', { title: generalNodeDictionary('publicKeyShort') })}
          </RowLabel>
          <PubKey
            pubKey={pubkey}
            alwaysShowCopyButton
            leadingChars={8}
            trailingChars={4}
            side={tooltipSide}
          />
        </span>
      ) : null}
    </NodeCardText>
  );
}
