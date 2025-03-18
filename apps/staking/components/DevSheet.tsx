'use client';

import { SOCIALS } from '@/lib/constants';
import { isProduction } from '@/lib/env';
import {
  type FEATURE_FLAG,
  FEATURE_FLAG_DESCRIPTION,
  globalFeatureFlags,
  pageFeatureFlags,
  remoteFeatureFlagsInfo,
} from '@/lib/feature-flags';
import {
  useFeatureFlags,
  useRemoteFeatureFlagsQuery,
  useSetFeatureFlag,
} from '@/lib/feature-flags-client';
import logger from '@/lib/logger';
import { useStakingBackendSuspenseQuery } from '@/lib/staking-api-client';
import { SENT_DECIMALS, addresses } from '@session/contracts';
import { TestnetServiceNodeRewardsAbi } from '@session/contracts/abis';
import {
  formatSENTBigInt,
  useAllowanceQuery,
  useProxyApproval,
} from '@session/contracts/hooks/Token';
import { useContractReadQuery } from '@session/contracts/hooks/useContractReadQuery';
import type { SessionStakingClient } from '@session/staking-api-js/client';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { PubKey } from '@session/ui/components/PubKey';
import { Social } from '@session/ui/components/SocialLinkList';
import { Loading } from '@session/ui/components/loading';
import { LoadingText } from '@session/ui/components/loading-text';
import { toast } from '@session/ui/lib/toast';
import { Button } from '@session/ui/ui/button';
import { Checkbox } from '@session/ui/ui/checkbox';
import { Input } from '@session/ui/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@session/ui/ui/sheet';
import { Switch } from '@session/ui/ui/switch';
import { Tooltip } from '@session/ui/ui/tooltip';
import type { BuildInfo } from '@session/util-js/build';
import { getEnvironment } from '@session/util-js/env';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { http, type Address, createWalletClient } from 'viem';
import { nonceManager, privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';

export function DevSheet({ buildInfo }: { buildInfo: BuildInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const featureFlags = useFeatureFlags();
  const { data } = useRemoteFeatureFlagsQuery();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Checks for the ctrl + k key combination
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (event.code === 'Escape') {
        setIsOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const { COMMIT_HASH, COMMIT_HASH_PRETTY } = buildInfo.env;

  const remoteFeatureFlagArray = useMemo(() => (data ? Array.from(data) : []), [data]);

  const textToCopy = useMemo(() => {
    const enabledFeatureFlags = Object.entries(featureFlags)
      .filter(([, enabled]) => enabled)
      .map(([flag]) => flag);
    const sections = [
      `Commit Hash: ${COMMIT_HASH}`,
      `Build Env: ${getEnvironment()}`,
      `Is Production: ${isProduction ? 'True' : 'False'}`,
      `Remote Feature Flags: ${data ? (remoteFeatureFlagArray.length > 0 ? remoteFeatureFlagArray.join(', ') : 'None') : 'Loading...'}`,
      `Feature Flags: ${enabledFeatureFlags.length > 0 ? enabledFeatureFlags.join(', ') : 'None'}`,
      `User Agent: ${navigator.userAgent}`,
    ];
    return sections.join('\n');
  }, [data, featureFlags, remoteFeatureFlagArray, COMMIT_HASH]);

  return (
    <Sheet open={isOpen}>
      <SheetContent closeSheet={() => setIsOpen(false)} className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Welcome to the danger zone</SheetTitle>
          <SheetDescription>
            This sheet only shows when the site is in development mode.
          </SheetDescription>
          <SheetTitle>
            Build Info{' '}
            {data ? (
              <CopyToClipboardButton
                textToCopy={textToCopy}
                copyToClipboardToastMessage={textToCopy}
                data-testid={'button:dont-worry-about-it'}
              />
            ) : null}
          </SheetTitle>
          <span className="inline-flex justify-start gap-1 align-middle">
            {'Commit Hash:'}
            <Link
              href={`${SOCIALS[Social.Github].link}/commit/${buildInfo.env.COMMIT_HASH}`}
              target="_blank"
              className="text-session-green"
            >
              <span>{COMMIT_HASH_PRETTY}</span>
            </Link>
          </span>
          <span className="inline-flex justify-start gap-1 align-middle">
            {'Build Env:'}
            <span className="text-session-green">{getEnvironment()}</span>
          </span>
          <span className="inline-flex justify-start gap-1 align-middle">
            {'Is Production:'}
            <span className="text-session-green">{isProduction ? 'True' : 'False'}</span>
          </span>
          <SheetTitle>Remote Feature Flags 🧑</SheetTitle>
          <SheetDescription className="flex flex-col gap-2">
            {remoteFeatureFlagArray.length > 0
              ? remoteFeatureFlagArray.map((flag) => (
                  <div key={flag}>
                    <span className="font-medium">{'• '}</span>
                    <span className="text-session-green">{remoteFeatureFlagsInfo[flag].name}</span>
                    {': '}
                    <span key={flag}>{remoteFeatureFlagsInfo[flag].description}</span>
                  </div>
                ))
              : 'No remote feature flags enabled'}
          </SheetDescription>
          <SheetTitle>Global Feature Flags 🌏</SheetTitle>
          <SheetDescription className="flex flex-col gap-2">
            {globalFeatureFlags.map((flag) => (
              <FeatureFlagToggle flag={flag} key={flag} initialState={featureFlags[flag]} />
            ))}
          </SheetDescription>
          <PageSpecificFeatureFlags />
          <ContractActions />
          <ToastWorkshop />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

function PageSpecificFeatureFlags() {
  const pathname = usePathname();
  const featureFlags = useFeatureFlags();

  const pageFlags = pathname
    .split('/')
    .flatMap((slug) => pageFeatureFlags[slug])
    .filter((flag) => flag !== undefined);

  if (!pageFlags || pageFlags.length === 0) return null;

  return (
    <>
      <SheetTitle>Page Specific Feature Flags 📄</SheetTitle>
      <SheetDescription className="flex flex-col gap-2">
        {pageFlags.map((flag) => (
          <FeatureFlagToggle flag={flag} key={flag} initialState={featureFlags[flag]} />
        ))}
      </SheetDescription>
    </>
  );
}

function FeatureFlagToggle({
  flag,
  initialState,
  disabled,
}: {
  flag: FEATURE_FLAG;
  initialState: boolean;
  disabled?: boolean;
}) {
  const { setFeatureFlag } = useSetFeatureFlag();
  return (
    <span className="inline-flex justify-start gap-1 align-middle">
      <Switch
        key={flag}
        defaultChecked={initialState}
        disabled={disabled}
        onCheckedChange={(checked) => {
          setFeatureFlag(flag, checked);
        }}
        className="h-4 w-8 [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"
      />
      <Tooltip tooltipContent={flag}>
        <span className="cursor-pointer">{FEATURE_FLAG_DESCRIPTION[flag]}</span>
      </Tooltip>
    </span>
  );
}

function ContractActions() {
  const [value, setValue] = useState<string>('0');
  const serviceNodeRewardsAddress = addresses.ServiceNodeRewards[arbitrumSepolia.id];

  const tokenAmount = useMemo(() => BigInt(value) * BigInt(10 ** SENT_DECIMALS), [value]);

  const {
    allowance,
    refetch,
    status: allowanceStatus,
  } = useAllowanceQuery({
    contractAddress: serviceNodeRewardsAddress,
  });

  const { approveWrite, resetApprove, status } = useProxyApproval({
    contractAddress: serviceNodeRewardsAddress,
    tokenAmount,
  });

  const handleClick = () => {
    if (status !== 'idle') {
      resetApprove();
    }
    approveWrite();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Don't need to worry about refetch changing
  useEffect(() => {
    if (status === 'success') void refetch();
  }, [status]);

  return (
    <>
      <SheetTitle>Contract Actions 🚀</SheetTitle>
      <span className="inline-flex justify-start gap-1 align-middle">
        <span className="inline-flex justify-start gap-1 align-middle">
          {'Allowance:'}
          <span className="text-session-green">
            {allowanceStatus === 'success' ? formatSENTBigInt(allowance) : <LoadingText />}
          </span>
        </span>
      </span>
      <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        data-testid="button:reset-allowance"
        onClick={handleClick}
        size="sm"
        rounded="md"
        disabled={status === 'pending' || tokenAmount === allowance}
      >
        {status === 'pending' ? (
          <LoadingText />
        ) : tokenAmount > BigInt(0) ? (
          'Set Allowance'
        ) : (
          'Reset Allowance'
        )}
      </Button>
      <ExitNodes />
    </>
  );
}

export function getExitLiquidationList(client: SessionStakingClient) {
  return client.exitLiquidationList();
}

function ExitNodes() {
  const [value, setValue] = useState<string>('0x');
  const [selectedContractIds, setSelectedContractIds] = useState<Array<number>>([]);
  const { data, status } = useStakingBackendSuspenseQuery(getExitLiquidationList);

  const { data: blsKeyContractIdMapData, status: blsKeyContractIdMapStatus } = useContractReadQuery(
    {
      contract: 'ServiceNodeRewards',
      functionName: 'allServiceNodeIDs',
      enabled: status === 'success',
    }
  );

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: complexity is fine here
  const nodes = useMemo(() => {
    if (
      status === 'success' &&
      data &&
      blsKeyContractIdMapStatus === 'success' &&
      blsKeyContractIdMapData
    ) {
      const [ids, blsKeys] = blsKeyContractIdMapData;

      // Create an object that maps "<x:064x><y:064x>" to the contractId
      const result: Record<string, number> = {};

      for (let i = 0; i < ids.length; i++) {
        const contractId = ids[i];
        if (!contractId) {
          console.warn('Unexpected null contractId');
          continue;
        }
        const blsKeyPair = blsKeys[i];
        if (!blsKeyPair) {
          console.warn('Unexpected null blsKeyPair');
          continue;
        }
        const { X, Y } = blsKeyPair;

        // Convert x and y to 64-char hex strings and concatenate
        const key = `${X.toString(16).padStart(64, '0')}${Y.toString(16).padStart(64, '0')}`;
        result[key] = Number.parseInt(contractId.toString());
      }

      const nodeList: Array<{ contractId: number; pubKey: string }> = [];

      for (const node of data.result) {
        const contractId = result[node.info.bls_public_key];
        if (!contractId) {
          console.warn('No contractId found for blsKey', node.info.bls_public_key);
          continue;
        }
        nodeList.push({ contractId, pubKey: node.service_node_pubkey });
      }

      return nodeList.sort((a, b) => a.contractId - b.contractId);
    }
    return [];
  }, [data, status, blsKeyContractIdMapStatus, blsKeyContractIdMapData]);

  const handleEjectNodes = async () => {
    if (selectedContractIds.length === 0) return;
    try {
      if (!value.startsWith('0x')) setValue((v) => `0x${v}`);
      const wallet = createWallet({ privateKey: value as Address });
      await ejectNodes({
        wallet,
        idsToBoot: selectedContractIds,
        batchSize: 10,
      });
    } catch (e) {
      if (e instanceof Error) toast.handleError(e);
      else console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <SheetTitle>Exit Liquidation List 🔫</SheetTitle>
      <span>
        Private Key
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      </span>
      {nodes ? (
        <>
          <Button
            data-testid="button:eject-nodes"
            disabled={selectedContractIds.length === 0}
            onClick={handleEjectNodes}
            size="sm"
            rounded="md"
          >
            Execute {selectedContractIds.length} Nodes
          </Button>
          <div>
            <Checkbox
              checked={selectedContractIds.length === nodes.length}
              onCheckedChange={() =>
                setSelectedContractIds((ids) =>
                  ids.length === nodes.length ? [] : nodes.map(({ contractId }) => contractId)
                )
              }
            />{' '}
            {'Select All'}
          </div>
          <ul className="flex max-h-40 flex-col overflow-y-auto">
            {nodes.map(({ contractId, pubKey }) => (
              <li key={contractId} className="flex flex-row gap-1 align-middle">
                <Checkbox
                  checked={selectedContractIds.includes(contractId)}
                  onCheckedChange={() =>
                    setSelectedContractIds((ids) =>
                      ids.includes(contractId)
                        ? ids.filter((i) => i !== contractId)
                        : [...ids, contractId]
                    )
                  }
                />
                {contractId} <PubKey pubKey={pubKey} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

function createWallet({ privateKey }: { privateKey: Address }) {
  const account = privateKeyToAccount(privateKey, { nonceManager });
  return createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });
}

async function ejectNodes({
  wallet,
  idsToBoot,
  batchSize,
}: {
  wallet: ReturnType<typeof createWallet>;
  idsToBoot: number[];
  batchSize: number;
}) {
  let total = 0;
  let batchIndex = 0;

  for (let i = 0; i < idsToBoot.length; i += batchSize) {
    const array: number[] = [];
    for (let offset = 0; offset < batchSize; offset++) {
      const index = i + offset;
      if (index >= idsToBoot.length) break;
      total++;
      const id = idsToBoot[index];
      if (!id) {
        throw `ID IS UNDEFINED index:${i}`;
      }
      array.push(id);
    }

    const arrBigInted = array.map(BigInt);

    const hash = await wallet.writeContract({
      address: addresses.ServiceNodeRewards[arbitrumSepolia.id],
      abi: TestnetServiceNodeRewardsAbi,
      functionName: 'exitNodeBySNID',
      args: [arrBigInted],
    });
    logger.info(`Hash: ${hash}`);
    logger.info(`Batch ${batchIndex} exited: ${array}`);
    toast.success(`Batch ${batchIndex} exited: ${array}`);
    batchIndex++;
  }

  logger.info(`Total: ${total}`);
  logger.info(`Actual: ${idsToBoot.length}`);
}

const toastWorkshopFallbackText = 'Toast Workshop 🍞';
const toastWorkshopBigText = toastWorkshopFallbackText.repeat(20);

function ToastWorkshop() {
  const [customText, setCustomText] = useState<string>('');
  const [useBigText, setUseBigText] = useState(false);

  const text = useBigText ? toastWorkshopBigText : customText || toastWorkshopFallbackText;

  return (
    <div className="flex flex-col gap-2">
      <SheetTitle>{toastWorkshopFallbackText}</SheetTitle>
      <Input
        placeholder="Custom Text"
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
      />
      <span className="flex flex-row items-center gap-2">
        <Switch checked={useBigText} onCheckedChange={(checked) => setUseBigText(checked)} />
        Use Big Text
      </span>
      <Button
        data-testid="button:toast-workshop"
        size="xs"
        variant="secondary"
        onClick={() => {
          toast.success(text);
        }}
      >
        Success
      </Button>
      <Button
        data-testid="button:toast-workshop"
        size="xs"
        variant="secondary"
        onClick={() => {
          toast.error(text);
        }}
      >
        Error
      </Button>
      <Button
        data-testid="button:toast-workshop"
        size="xs"
        variant="secondary"
        onClick={() => {
          toast.info(text);
        }}
      >
        Info
      </Button>
      <Button
        data-testid="button:toast-workshop"
        size="xs"
        variant="secondary"
        onClick={() => {
          toast.warning(text);
        }}
      >
        Warning
      </Button>
      <Button
        data-testid="button:toast-workshop"
        size="xs"
        variant="secondary"
        onClick={() => {
          toast.promise(new Promise((resolve) => setTimeout(resolve, 5000)), {
            loading: 'Loading...',
            success: text,
          });
        }}
      >
        Success 5s
      </Button>
      <Button
        data-testid="button:toast-workshop"
        size="xs"
        variant="secondary"
        onClick={() => {
          toast.handleError(new Error(text));
        }}
      >
        Error
      </Button>
    </div>
  );
}
