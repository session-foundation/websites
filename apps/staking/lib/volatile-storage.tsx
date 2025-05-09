import { VOLATILE_STORAGE } from '@/lib/constants';
import logger from '@/lib/logger';
import { useVolatileStorage } from '@/providers/volatile-storage-provider';
import { ed25519PublicKeySchema, ethereumAddressSchema } from '@session/staking-api-js/schema';
import { safeTrySyncWithFallback } from '@session/util-js/try';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

export enum CONFIRMATION_TYPE {
  REGISTRATION = 'registration',
  EXIT_REQUEST = 'exitRequest',
  EXIT = 'exit',
}

const volatileStorageNodeConfirmingSchema = z.object({
  pubkeyEd25519: ed25519PublicKeySchema,
  pubkeyBls: z.string(),
  operatorAddress: ethereumAddressSchema,
  rewardsAddress: ethereumAddressSchema.nullable(),
  estimatedConfirmationTimestampMs: z.coerce.number(),
  confirmationType: z.nativeEnum(CONFIRMATION_TYPE),
  confirmationOwner: ethereumAddressSchema,
});

export type VolatileStorageNodeConfirming = z.infer<typeof volatileStorageNodeConfirmingSchema>;

export const useNodesWithConfirmations = () => {
  const { getItem, setItem } = useVolatileStorage();
  const nodesConfirming = getItem<string>(VOLATILE_STORAGE.NODES_CONFIRMING);

  const nodes = useMemo(() => {
    const nodeMap = {
      nodesConfirmingRegistration: [] as Array<VolatileStorageNodeConfirming>,
      nodesConfirmingExitRequest: [] as Array<VolatileStorageNodeConfirming>,
      nodesConfirmingExit: [] as Array<VolatileStorageNodeConfirming>,
    };

    const [err, unvalidatedNodes] = safeTrySyncWithFallback(
      () => JSON.parse(nodesConfirming ?? '[]') as Array<unknown>,
      []
    );
    if (err) logger.error(err);

    if (!Array.isArray(unvalidatedNodes)) return nodeMap;

    const nodes = unvalidatedNodes.filter(
      (m) => volatileStorageNodeConfirmingSchema.safeParse(m).success
    ) as Array<VolatileStorageNodeConfirming>;

    const now = Date.now();
    const nodesCurrentlyConfirming = nodes.filter((m) => m.estimatedConfirmationTimestampMs > now);

    if (nodesCurrentlyConfirming.length < unvalidatedNodes.length) {
      logger.debug('Volatile storage contains expired or invalid confirmations, removing them');
      setItem(VOLATILE_STORAGE.NODES_CONFIRMING, JSON.stringify(nodesCurrentlyConfirming));
    } else {
      for (const node of nodesCurrentlyConfirming) {
        switch (node.confirmationType) {
          case CONFIRMATION_TYPE.REGISTRATION:
            nodeMap.nodesConfirmingRegistration.push(node);
            break;
          case CONFIRMATION_TYPE.EXIT_REQUEST:
            nodeMap.nodesConfirmingExitRequest.push(node);
            break;
          case CONFIRMATION_TYPE.EXIT:
            nodeMap.nodesConfirmingExit.push(node);
            break;
          default:
            logger.error('Unknown confirmation type:', node.confirmationType);
            break;
        }
      }
    }

    return nodeMap;
  }, [nodesConfirming, setItem]);

  const addConfirmingNode = useCallback(
    (node: VolatileStorageNodeConfirming) => {
      const currentlyConfirming = nodes.nodesConfirmingRegistration
        .concat(nodes.nodesConfirmingExitRequest)
        .concat(nodes.nodesConfirmingExit);
      const parsedNode = volatileStorageNodeConfirmingSchema.parse(node);
      if (
        currentlyConfirming.some(
          (m) =>
            m.pubkeyEd25519 === parsedNode.pubkeyEd25519 &&
            m.confirmationType === parsedNode.confirmationType
        )
      ) {
        logger.debug('Node already confirming, ignoring');
        return;
      }
      currentlyConfirming.push(parsedNode);
      setItem(VOLATILE_STORAGE.NODES_CONFIRMING, JSON.stringify(currentlyConfirming));
    },
    [nodes, setItem]
  );

  return {
    nodes,
    addConfirmingNode,
  };
};

export type NodesWithConfirmations = ReturnType<typeof useNodesWithConfirmations>['nodes'];
