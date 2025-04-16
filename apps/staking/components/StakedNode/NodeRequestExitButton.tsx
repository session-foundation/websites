<<<<<<< HEAD
import { ButtonDataTestId, LinkDataTestId } from '@/testing/data-test-ids';
import { useTranslations } from 'next-intl';
import { CollapsableButton } from '@/components/StakedNodeCard';
=======
import { CollapsableButton } from '@/components/NodeCard';
import NodeActionModuleInfo from '@/components/StakedNode/NodeActionModuleInfo';
import useRequestNodeExit from '@/hooks/useRequestNodeExit';
import { SESSION_NODE_TIME, SOCIALS, URL } from '@/lib/constants';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { formatLocalizedTimeFromSeconds } from '@/lib/locale-client';
import { externalLink } from '@/lib/locale-defaults';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { Stake } from '@session/staking-api-js/schema';
import { Social } from '@session/ui/components/SocialLinkList';
import { Loading } from '@session/ui/components/loading';
import { ChevronsDownIcon } from '@session/ui/icons/ChevronsDownIcon';
import { PROGRESS_STATUS, Progress } from '@session/ui/motion/progress';
>>>>>>> dev
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from '@session/ui/ui/alert-dialog';
import { Button } from '@session/ui/ui/button';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

enum EXIT_REQUEST_STATE {
  ALERT = 0,
  PENDING = 1,
}

export function NodeRequestExitButton({ node }: { node: Stake }) {
  const [exitRequestState, setExitRequestState] = useState<EXIT_REQUEST_STATE>(
    EXIT_REQUEST_STATE.ALERT
  );
  const dictionary = useTranslations('nodeCard.staked.requestExit');
  const { enabled: isNodeExitRequestDisabled, isLoading: isRemoteFlagLoading } =
    useRemoteFeatureFlagQuery(REMOTE_FEATURE_FLAG.DISABLE_REQUEST_NODE_EXIT);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <CollapsableButton
          ariaLabel={dictionary('buttonAria')}
          dataTestId={ButtonDataTestId.Staked_Node_Request_Exit}
        >
          {dictionary('buttonText')}
        </CollapsableButton>
      </AlertDialogTrigger>
      <AlertDialogContent
        dialogTitle={
          <>
            {exitRequestState !== EXIT_REQUEST_STATE.ALERT ? (
              <ChevronsDownIcon
                className="absolute left-8 mt-1.5 rotate-90 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
                onClick={() => setExitRequestState(EXIT_REQUEST_STATE.ALERT)}
              />
            ) : null}
            {dictionary('dialog.title')}
          </>
        }
        className="text-center"
      >
        {isRemoteFlagLoading ? (
          <Loading />
        ) : isNodeExitRequestDisabled ? (
          <RequestNodeExitDisabled />
        ) : exitRequestState === EXIT_REQUEST_STATE.PENDING ? (
          <RequestNodeExitContractWriteDialog node={node} />
        ) : (
          <RequestNodeExitDialog
            node={node}
            onSubmit={() => setExitRequestState(EXIT_REQUEST_STATE.PENDING)}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RequestNodeExitDisabled() {
  const dictionary = useTranslations('nodeCard.staked.requestExit');
  return (
    <p>
      {dictionary.rich('disabledInfo', {
        link: (children: ReactNode) => (
          <Link
            className="font-medium text-session-green underline"
            href={SOCIALS[Social.Discord].link}
            referrerPolicy="no-referrer"
            target="_blank"
          >
            {children}
          </Link>
        ),
      })}
    </p>
  );
}

function formatEnglishTimeDistance(seconds: number, delimiter = ' ', addPluralSuffix = false) {
  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days}${delimiter}day${days > 1 && addPluralSuffix ? 's' : ''}`;

  const hours = Math.floor((seconds % 86400) / 3600);
  if (hours > 0) return `${hours}${delimiter}hour${hours > 1 && addPluralSuffix ? 's' : ''}`;

  const minutes = Math.floor((seconds % 3600) / 60);
  if (minutes > 0)
    return `${minutes}${delimiter}minute${minutes > 1 && addPluralSuffix ? 's' : ''}`;

  return `${Math.floor(seconds)}${delimiter}second${seconds > 1 && addPluralSuffix ? 's' : ''}`;
}

function RequestNodeExitDialog({ node, onSubmit }: { node: Stake; onSubmit: () => void }) {
  const { chainId } = useWallet();

  const dictionary = useTranslations('nodeCard.staked.requestExit.dialog');

  return (
    <>
      <div className="font-medium text-lg">{dictionary('description.title')}</div>
      <p>
        {dictionary.rich('description.content', {
          request_time: formatLocalizedTimeFromSeconds(
            SESSION_NODE_TIME(chainId).EXIT_REQUEST_TIME_SECONDS,
            {
              addSuffix: true,
            }
          ),
          exit_time: formatEnglishTimeDistance(
            SESSION_NODE_TIME(chainId).EXIT_GRACE_TIME_SECONDS,
            '-'
          ),
          link: externalLink({
            href: URL.NODE_LIQUIDATION_LEARN_MORE,
            dataTestId: LinkDataTestId.Request_Exit_Liquidation_Learn_More,
          }),
        })}
      </p>
      <AlertDialogFooter className="mt-4 flex w-full flex-col font-medium sm:flex-row">
        <Button
          variant="destructive-ghost"
          rounded="md"
          size="lg"
          aria-label={dictionary('buttons.submitAria', {
            pubKey: node.service_node_pubkey,
          })}
          className="w-full"
          data-testid={ButtonDataTestId.Staked_Node_Request_Exit_Dialog_Submit}
          onClick={onSubmit}
          type="submit"
        >
          {dictionary('buttons.submit')}
        </Button>
        <AlertDialogCancel asChild>
          <Button
            variant="ghost"
            rounded="md"
            size="lg"
            className="w-full"
            aria-label={dictionary('buttons.cancelAria')}
            data-testid={ButtonDataTestId.Staked_Node_Request_Exit_Dialog_Cancel}
          >
            {dictionary('buttons.cancel')}
          </Button>
        </AlertDialogCancel>
      </AlertDialogFooter>
    </>
  );
}

function RequestNodeExitContractWriteDialog({ node }: { node: Stake }) {
  const stageDictKey = 'nodeCard.staked.requestExit.dialog.stage' as const;
  const dictionary = useTranslations('nodeCard.staked.requestExit.dialog.write');
  const dictionaryStage = useTranslations(stageDictKey);

  const {
    initiateRemoveBLSPublicKey,
    fee,
    gasAmount,
    gasPrice,
    simulateEnabled,
    resetContract,
    status,
    errorMessage,
  } = useRequestNodeExit({
    contractId: node.contract_id,
  });

  const handleClick = () => {
    if (simulateEnabled) {
      resetContract();
    }
    initiateRemoveBLSPublicKey();
  };

  const isDisabled = !node.contract_id;

  return (
    <>
      <NodeActionModuleInfo node={node} fee={fee} gasAmount={gasAmount} gasPrice={gasPrice} />
      <AlertDialogFooter className="mt-4 flex flex-col gap-8 sm:flex-col">
        <Button
          variant="destructive"
          rounded="md"
          size="lg"
          aria-label={dictionary('buttons.submitAria')}
          className="w-full"
          data-testid={ButtonDataTestId.Staked_Node_Request_Exit_Write_Dialog_Submit}
          disabled={isDisabled || (simulateEnabled && status !== PROGRESS_STATUS.ERROR)}
          onClick={handleClick}
        >
          {dictionary('buttons.submit')}
        </Button>
        {simulateEnabled ? (
          <Progress
            steps={[
              {
                text: {
                  [PROGRESS_STATUS.IDLE]: dictionaryStage('arbitrum.idle'),
                  [PROGRESS_STATUS.PENDING]: dictionaryStage('arbitrum.pending'),
                  [PROGRESS_STATUS.SUCCESS]: dictionaryStage('arbitrum.success'),
                  [PROGRESS_STATUS.ERROR]: errorMessage,
                },
                status,
              },
              {
                text: {
                  [PROGRESS_STATUS.IDLE]: dictionaryStage('network.idle'),
                  [PROGRESS_STATUS.PENDING]: dictionaryStage('network.pending'),
                  [PROGRESS_STATUS.SUCCESS]: dictionaryStage('network.success'),
                  [PROGRESS_STATUS.ERROR]: errorMessage,
                },
                status:
                  status === PROGRESS_STATUS.SUCCESS
                    ? PROGRESS_STATUS.SUCCESS
                    : PROGRESS_STATUS.IDLE,
              },
            ]}
          />
        ) : null}
      </AlertDialogFooter>
    </>
  );
}
