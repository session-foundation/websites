'use client';

import { InfoNodeCard, NodeItem, NodeItemLabel, NodeItemValue } from '@/components/InfoNodeCard';
import { useCurrentActor } from '@/hooks/useCurrentActor';
import useRelativeTime from '@/hooks/useRelativeTime';
import logger from '@/lib/logger';
import { deleteNodeRegistrationForSnKey } from '@/lib/queries/deleteNodeRegistrationForSnKey';
import { useStakingBackendMutationQueryWithParams } from '@/lib/staking-api-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { Registration } from '@session/staking-api-js/schema';
import { BinIcon } from '@session/ui/icons/BinIcon';
import { toast } from '@session/ui/lib/toast';
import { Button } from '@session/ui/ui/button';
import { useSignMessage } from '@session/wallet/hooks/useSignMessage';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { type HTMLAttributes, forwardRef, useMemo, useRef } from 'react';

function useDeleteNodeRegistration(node: Registration) {
  const { address: signer } = useWallet();
  const operator = useCurrentActor();
  const signatureTimestampS = useRef<number>(Math.trunc(Date.now() / 1000));

  const onError = (error: Error | string) => {
    if (error instanceof Error) {
      toast.handleError(error);
    } else {
      toast.error(error);
      logger.warn(error);
    }
  };

  const body = useMemo(() => {
    if (!operator || !signer || !signatureTimestampS.current) {
      return;
    }

    return {
      operator,
      signer,
      pubkey_ed25519: node.pubkey_ed25519,
      pubkey_bls: node.pubkey_bls,
      timestamp_registration: node.timestamp,
      timestamp_signature: signatureTimestampS.current,
    };
  }, [operator, signer, node]);

  const dataToSign = useMemo(() => {
    if (!body) return;

    return Object.entries(body)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  }, [body]);

  const { mutate } = useStakingBackendMutationQueryWithParams(deleteNodeRegistrationForSnKey);
  const { signMessage } = useSignMessage({
    mutation: {
      onError,
      onSuccess: (signature) => {
        if (!dataToSign || !signature) {
          logger.warn(`Unable to delete registration for ${node.pubkey_ed25519}`);
          toast.error('Failed to delete registration!');
          return;
        }

        mutate({
          ...body,
          signature,
        });
      },
    },
  });

  const deleteNode = () => {
    if (!signer) {
      toast.error('No signer detected!');
      return;
    }

    if (!dataToSign) {
      toast.error('Data to sign is invalid!');
      return;
    }

    return signMessage({
      account: signer,
      message: dataToSign,
    });
  };

  return {
    deleteNode,
  };
}

function DeleteNodeRegistrationButton({ node }: { node: Registration }) {
  const { deleteNode } = useDeleteNodeRegistration(node);

  return (
    <Button
      variant="destructive-outline"
      size="md"
      rounded="md"
      onClick={() => deleteNode()}
      data-testid={ButtonDataTestId.Hide_Prepared_Registration}
      className="group inline-flex gap-1 align-middle"
    >
      <BinIcon className="h-5 w-5 stroke-destructive group-hover:stroke-session-black" />
    </Button>
  );
}

type NodeRegistrationCardProps = HTMLAttributes<HTMLDivElement> & {
  node: Registration;
  showDeleteButton?: boolean;
};

const NodeRegistrationCard = forwardRef<HTMLDivElement, NodeRegistrationCardProps>(
  ({ className, node, showDeleteButton, ...props }, ref) => {
    const dictionary = useTranslations('nodeCard.pending');
    const dictRegistration = useTranslations('actionModules.registration.shared');
    const titleFormat = useTranslations('modules.title');
    const pathname = usePathname();

    const { pubkey_ed25519: pubKey, timestamp } = node;

    const preparedTimer = useRelativeTime(new Date(timestamp * 1000), { addSuffix: true });

    const isRegistrationFormOpen = useMemo(
      () => pathname === `/register/${pubKey}`,
      [pathname, pubKey]
    );

    return (
      <InfoNodeCard
        ref={ref}
        className={className}
        pubKey={pubKey}
        isActive={isRegistrationFormOpen}
        buttonSiblings={showDeleteButton ? <DeleteNodeRegistrationButton node={node} /> : null}
        button={
          !isRegistrationFormOpen
            ? {
                ariaLabel: dictionary('registerButton.ariaLabel'),
                text: dictionary('registerButton.text'),
                dataTestId: ButtonDataTestId.Node_Card_Register,
                link: `/register/${pubKey}`,
              }
            : undefined
        }
        {...props}
      >
        <NodeItem>
          <NodeItemLabel>
            {titleFormat('format', { title: dictRegistration('submit.preparedAt') })}
          </NodeItemLabel>
          <NodeItemValue>{preparedTimer}</NodeItemValue>
        </NodeItem>
      </InfoNodeCard>
    );
  }
);

NodeRegistrationCard.displayName = 'NodeRegistrationCard';

export { NodeRegistrationCard };
