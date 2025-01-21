import { ButtonDataTestId } from '@/testing/data-test-ids';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from '@session/ui/ui/alert-dialog';
import { Button } from '@session/ui/ui/button';
import { type ReactNode, useState } from 'react';
import { formatLocalizedTimeFromSeconds } from '@/lib/locale-client';
import { SESSION_NODE_TIME, SOCIALS, URL } from '@/lib/constants';
import { externalLink } from '@/lib/locale-defaults';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { Loading } from '@session/ui/components/loading';
import Link from 'next/link';
import { Social } from '@session/ui/components/SocialLinkList';
import { ChevronsDownIcon } from '@session/ui/icons/ChevronsDownIcon';
import { Progress, PROGRESS_STATUS } from '@session/ui/motion/progress';
import useRequestNodeExit from '@/hooks/useRequestNodeExit';
import NodeActionModuleInfo from '@/components/StakedNode/NodeActionModuleInfo';
import { Stake } from '@session/staking-api-js/client';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { CollapsableButton } from '@/components/NodeCard';

enum EXIT_REQUEST_STATE {
  ALERT,
  PENDING,
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
                className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute left-8 mt-1.5 rotate-90 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
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
            className="text-session-green font-medium underline"
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

function RequestNodeExitDialog({ node, onSubmit }: { node: Stake; onSubmit: () => void }) {
  const { chainId } = useWallet();

  const dictionary = useTranslations('nodeCard.staked.requestExit.dialog');

  return (
    <>
      <div className="text-lg font-medium">{dictionary('description1')}</div>
      <p>
        {dictionary('description2', {
          request_time: formatLocalizedTimeFromSeconds(
            SESSION_NODE_TIME(chainId).EXIT_REQUEST_TIME_SECONDS,
            {
              addSuffix: true,
            }
          ),
        })}
        <br />
        <br />
        {dictionary.rich('description3', {
          request_time: formatLocalizedTimeFromSeconds(
            SESSION_NODE_TIME(chainId).EXIT_REQUEST_TIME_SECONDS
          ),
          exit_time: formatLocalizedTimeFromSeconds(
            SESSION_NODE_TIME(chainId).EXIT_GRACE_TIME_SECONDS
          ),
          link: externalLink(URL.NODE_LIQUIDATION_LEARN_MORE),
        })}
        <br />
        <br />
        {dictionary('description4')}
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
