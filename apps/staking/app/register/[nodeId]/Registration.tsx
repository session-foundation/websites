'use client';

import { AutoActivateTab } from '@/app/register/[nodeId]/multi/AutoActivateTab';
import { OperatorFeeTab } from '@/app/register/[nodeId]/multi/OperatorFeeTab';
import { RewardsAddressInputMultiTab } from '@/app/register/[nodeId]/multi/RewardsAddressInputMultiTab';
import { RewardsAddressTab } from '@/app/register/[nodeId]/multi/RewardsAddressTab';
import { StakeAmountTab } from '@/app/register/[nodeId]/multi/StakeAmountTab';
import { SubmitMultiTab } from '@/app/register/[nodeId]/multi/SubmitMultiTab';
import { type RegistrationStartFormSchema, StartTab } from '@/app/register/[nodeId]/shared/Start';
import { RewardsAddressInputSoloTab } from '@/app/register/[nodeId]/solo/RewardsAddressInputSoloTab';
import { SubmitSoloTab } from '@/app/register/[nodeId]/solo/SubmitSoloTab';
import { SuccessMultiTab } from '@/app/register/[nodeId]/multi/SuccessMultiTab';
import { SuccessSoloTab } from '@/app/register/[nodeId]/solo/SuccessSoloTab';
import {
  isUserSelectableRegistrationMode,
  NODE_TYPE,
  parseTab,
  REG_MODE,
  REG_TAB,
} from '@/app/register/[nodeId]/types';
import { getEthereumAddressFormFieldSchema } from '@/components/Form/EthereumAddressField';
import {
  getOperatorFeeFormFieldSchema,
  type GetOperatorFeeFormFieldSchemaArgs,
} from '@/components/Form/OperatorFeeField';
import {
  getStakeAmountFormFieldSchema,
  type GetStakeAmountFormFieldSchemaArgs,
} from '@/components/Form/StakeAmountField';
import { WizardContent } from '@/components/Wizard';
import {
  PREFERENCE,
  preferenceStorageDefaultItems,
  REGISTRATION_LINKS,
  SESSION_NODE,
  SESSION_NODE_FULL_STAKE_AMOUNT,
  SESSION_NODE_MIN_STAKE_MULTI_OPERATOR,
} from '@/lib/constants';
import { useDecimalDelimiter } from '@/lib/locale-client';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { SENT_DECIMALS } from '@session/contracts';
import { formatSENTBigIntNoRounding } from '@session/contracts/hooks/Token';
import {
  CONTRIBUTION_CONTRACT_STATUS,
  type ContributorContractInfo,
} from '@session/staking-api-js/client';
import { useForm } from '@session/ui/ui/form';
import { bigIntMin, bigIntToString, stringToBigInt } from '@session/util-crypto/maths';
import { useWalletTokenBalance } from '@session/wallet/components/WalletButton';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useWalletButton } from '@session/wallet/providers/wallet-button-provider';
import { useTranslations } from 'next-intl';
import React, {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePreferences } from 'usepref';
import { type Address, isAddress } from 'viem';
import { z } from 'zod';
import useQueryParams, { type UseQueryParamsReturn } from '@/hooks/useQueryParams';
import { toast } from '@session/ui/lib/toast';
import { useStakes } from '@/hooks/useStakes';
import { areHexesEqual } from '@session/util-crypto/string';
import { AlreadyRegisteredMultiTab } from '@/app/register/[nodeId]/multi/AlreadyRegisteredMultiTab';
import { AlreadyRegisteredRunningTab } from '@/app/register/[nodeId]/shared/AlreadyRegisteredRunningTab';
import { safeTrySync } from '@session/util-js/try';
import {
  isValidReservedSlots,
  ReserveSlotsInputTab,
} from '@/app/register/[nodeId]/multi/ReserveSlotsInputTab';
import { ReserveSlotsTab } from '@/app/register/[nodeId]/multi/ReserveSlotsTab';
import type { ReservedContributorStruct } from '@/hooks/useCreateOpenNodeRegistration';

type RegistrationContext = UseQueryParamsReturn<REGISTRATION_QUERY_PARAM> & {
  address: Address;
  changeTab: (tab: REG_TAB) => void;
  contract: ContributorContractInfo | null;
  dict: ReturnType<typeof useTranslations<`actionModules.registration`>>;
  formMulti: ReturnType<typeof useForm<MultiRegistrationFormSchema>>;
  formSolo: ReturnType<typeof useForm<SoloRegistrationFormSchema>>;
  handleTabBackButtonClick: () => void;
  isError: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  mode: REG_MODE;
  nodeType: NODE_TYPE;
  props: RegistrationProps;
  setBackButtonClickCallback: Dispatch<SetStateAction<null | (() => void)>>;
  setContract: (contract: ContributorContractInfo | null) => void;
  setIsError: Dispatch<SetStateAction<boolean>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
  setMode: Dispatch<SetStateAction<REG_MODE>>;
  setStartData: (data: z.infer<typeof RegistrationStartFormSchema>) => void;
  tab: REG_TAB;
  tabHistory: Array<REG_TAB>;
};

const RegistrationContext = createContext<RegistrationContext | undefined>(undefined);

function RegistrationProvider({
  blsKey,
  blsSignature,
  children,
  ed25519PubKey,
  ed25519Signature,
  preparedAt,
}: RegistrationProps & { children: ReactNode }) {
  const { contracts, addedBlsKeys } = useStakes();

  const [backButtonClickCallback, setBackButtonClickCallback] = useState<null | (() => void)>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [tabHistory, setTabHistory] = useState<Array<REG_TAB>>([]);
  const [contract, setContract] = useState<ContributorContractInfo | null>(
    contracts.find(({ pubkey_bls }) => areHexesEqual(pubkey_bls, blsKey)) ?? null
  );

  const { address } = useWallet();
  const { value: balanceValue } = useWalletTokenBalance();
  const { getItem } = usePreferences();
  const { getQueryParams, pushQueryParam } = useQueryParams();
  const preferredRegistrationMode = getItem<REG_MODE>(PREFERENCE.PREF_REGISTRATION_MODE);
  const dict = useTranslations('actionModules.registration');
  const dictStakeAmount = useTranslations('actionModules.stakeAmount.validation');
  const dictOperatorFee = useTranslations('actionModules.operatorFee.validation');
  const decimalDelimiter = useDecimalDelimiter();

  const formMultiSchema = getRegistrationMultiFormSchema({
    stakeAmount: {
      isOperator: true,
      decimalDelimiter,
      minStake: SESSION_NODE_MIN_STAKE_MULTI_OPERATOR,
      maxStake: SESSION_NODE_FULL_STAKE_AMOUNT,
      underMinMessage: dictStakeAmount('underMin', {
        min: formatSENTBigIntNoRounding(SESSION_NODE_MIN_STAKE_MULTI_OPERATOR),
      }),
      underMinOperatorMessage: dictStakeAmount('underMinOperator', {
        min: formatSENTBigIntNoRounding(SESSION_NODE_MIN_STAKE_MULTI_OPERATOR),
      }),
      overMaxMessage: dictStakeAmount('overMax', {
        max: formatSENTBigIntNoRounding(SESSION_NODE_FULL_STAKE_AMOUNT),
      }),
    },
    operatorFee: {
      minOperatorFee: SESSION_NODE.MIN_OPERATOR_FEE,
      maxOperatorFee: SESSION_NODE.MAX_OPERATOR_FEE,
      incorrectFormatMessage: dictOperatorFee('incorrectFormat'),
      underMinOperatorFeeMessage: dictOperatorFee('underMin', {
        min: SESSION_NODE.MIN_OPERATOR_FEE,
      }),
      overMaxOperatorFeeMessage: dictOperatorFee('overMax', {
        max: SESSION_NODE.MAX_OPERATOR_FEE,
      }),
    },
  });

  const userPrefMode =
    preferredRegistrationMode && isUserSelectableRegistrationMode(preferredRegistrationMode)
      ? preferredRegistrationMode
      : preferenceStorageDefaultItems[PREFERENCE.PREF_REGISTRATION_MODE];

  const { queryParamFields, queryParamMode, queryParamNodeType, queryParamStartTab } =
    useMemo(() => {
      const queryParams = getQueryParams();

      if (queryParams.size === 0) {
        return {
          queryParamFields: null,
          queryParamMode: null,
          queryParamNodeType: null,
          queryParamStartTab: null,
        };
      }

      const {
        data,
        zod,
        mode: qpMode,
        nodeType: qpNodeType,
      } = parseRegistrationQueryParams(queryParams, formMultiSchema);

      if (zod.error) {
        for (const { message, path } of zod.error.issues) {
          const field = path[0];

          if (!field || typeof field !== 'string' || message === 'Required' || !(field in data)) {
            continue;
          }

          // This is fine, one day typescript will understand object key assertions
          data[field as keyof typeof data] = undefined;

          toast.error(message);
        }
      }

      let isExpress = userPrefMode === REG_MODE.EXPRESS;

      if (qpMode === REG_MODE.EXPRESS) {
        isExpress = true;
      } else if (qpMode === REG_MODE.GUIDED) {
        isExpress = false;
      }

      let queryParamStartTab = null;

      if (qpNodeType === NODE_TYPE.SOLO) {
        queryParamStartTab = REG_TAB.SUBMIT_SOLO;
      } else if (qpNodeType === NODE_TYPE.MULTI) {
        if (data?.stakeAmount === undefined) {
          queryParamStartTab = REG_TAB.STAKE_AMOUNT;
        } else if (data?.operatorFee === undefined) {
          queryParamStartTab = REG_TAB.OPERATOR_FEE;
        } else if (isExpress) {
          queryParamStartTab = REG_TAB.SUBMIT_MULTI;
        } else if (data?.rewardsAddress === undefined) {
          queryParamStartTab = REG_TAB.REWARDS_ADDRESS;
        } else if (data?.autoActivate === undefined) {
          queryParamStartTab = REG_TAB.AUTO_ACTIVATE;
        } else if (data?.reservedContributors === undefined) {
          queryParamStartTab = REG_TAB.RESERVE_SLOTS;
        } else {
          queryParamStartTab = REG_TAB.SUBMIT_MULTI;
        }
      }

      if (queryParamStartTab !== null) {
        setTabHistory([REG_TAB.START]);
      }

      return {
        queryParamFields: data,
        queryParamMode: qpMode,
        queryParamNodeType: qpNodeType,
        queryParamStartTab,
      };
    }, []);

  const alreadyRegisteredMulti =
    contract !== null &&
    (contract.status === CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib ||
      contract.status === CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib);

  const [tab, setTab] = useState<REG_TAB>(
    addedBlsKeys?.has(blsKey)
      ? REG_TAB.ALREADY_REGISTERED_RUNNING
      : alreadyRegisteredMulti
        ? REG_TAB.ALREADY_REGISTERED_MULTI
        : queryParamStartTab ?? REG_TAB.START
  );
  const [nodeType, setNodeType] = useState<NODE_TYPE>(
    alreadyRegisteredMulti ? NODE_TYPE.MULTI : queryParamNodeType ?? NODE_TYPE.SOLO
  );
  const [mode, setMode] = useState<REG_MODE>(queryParamMode ?? userPrefMode);

  function setStartData(data: z.infer<typeof RegistrationStartFormSchema>) {
    setMode(data.mode);
    pushQueryParam(REGISTRATION_QUERY_PARAM.MODE, data.mode);

    setNodeType(data.nodeType);
    pushQueryParam(REGISTRATION_QUERY_PARAM.IS_MULTI, data.nodeType === NODE_TYPE.MULTI);

    changeTab(data.nodeType === NODE_TYPE.SOLO ? REG_TAB.SUBMIT_SOLO : REG_TAB.STAKE_AMOUNT);
  }

  const changeTab = (targetTab: REG_TAB) => {
    setTabHistory((prev) => [...prev, tab]);
    setTab(targetTab);
    setBackButtonClickCallback(null);
  };

  const handleTabBackButtonClick = () => {
    if (backButtonClickCallback) {
      backButtonClickCallback();
    }
    setTab(tabHistory.at(-1) ?? REG_TAB.START);
    setTabHistory((prev) => prev.slice(0, -1));
    setBackButtonClickCallback(null);
  };

  if (!address) throw new Error('Address is required to create a registration');

  const formSolo = useForm<SoloRegistrationFormSchema>({
    resolver: zodResolver(getRegistrationSoloFormSchema()),
    defaultValues: {
      rewardsAddress: queryParamFields?.rewardsAddress ?? address,
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const formMulti = useForm<MultiRegistrationFormSchema>({
    resolver: zodResolver(formMultiSchema),
    defaultValues: {
      rewardsAddress: queryParamFields?.rewardsAddress ?? address,
      stakeAmount:
        queryParamFields?.stakeAmount ??
        bigIntToString(
          balanceValue
            ? bigIntMin(SESSION_NODE_MIN_STAKE_MULTI_OPERATOR, balanceValue)
            : SESSION_NODE_MIN_STAKE_MULTI_OPERATOR,
          SENT_DECIMALS,
          decimalDelimiter
        ),
      autoActivate: queryParamFields?.autoActivate ?? true,
      operatorFee: queryParamFields?.operatorFee ?? '',
      reservedContributors: queryParamFields?.reservedContributors ?? [],
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  return (
    <RegistrationContext.Provider
      value={{
        address,
        changeTab,
        contract,
        dict,
        formMulti,
        formSolo,
        handleTabBackButtonClick,
        isError,
        isSubmitting,
        isSuccess,
        mode,
        nodeType,
        props: {
          blsKey,
          ed25519PubKey,
          blsSignature,
          ed25519Signature,
          preparedAt,
        },
        setBackButtonClickCallback,
        setContract,
        setIsError,
        setIsSubmitting,
        setIsSuccess,
        setMode,
        setStartData,
        tab,
        tabHistory,
        getQueryParams,
        pushQueryParam,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistrationWizard() {
  const context = useContext(RegistrationContext);

  if (context === undefined) {
    throw new Error('useRegistrationWizard must be used within RegistrationProvider');
  }

  return context;
}

export function useTabDictionary(tab: REG_TAB) {
  const tabName = parseTab(tab);
  return useTranslations(`actionModules.registration.${tabName}`);
}

function getTab(tab: REG_TAB) {
  switch (tab) {
    case REG_TAB.START:
      return <StartTab />;

    /**
     * Solo Registration tabs
     */
    case REG_TAB.REWARDS_ADDRESS_INPUT_SOLO:
      return <RewardsAddressInputSoloTab />;
    case REG_TAB.SUBMIT_SOLO:
      return <SubmitSoloTab />;
    case REG_TAB.SUCCESS_SOLO:
      return <SuccessSoloTab />;

    /**
     * Multi Registration tabs
     */
    case REG_TAB.STAKE_AMOUNT:
      return <StakeAmountTab />;
    case REG_TAB.OPERATOR_FEE:
      return <OperatorFeeTab />;
    case REG_TAB.REWARDS_ADDRESS:
      return <RewardsAddressTab />;
    case REG_TAB.REWARDS_ADDRESS_INPUT_MULTI:
      return <RewardsAddressInputMultiTab />;
    case REG_TAB.RESERVE_SLOTS:
      return <ReserveSlotsTab />;
    case REG_TAB.RESERVE_SLOTS_INPUT:
      return <ReserveSlotsInputTab />;
    case REG_TAB.AUTO_ACTIVATE:
      return <AutoActivateTab />;
    case REG_TAB.SUBMIT_MULTI:
      return <SubmitMultiTab />;
    case REG_TAB.SUCCESS_MULTI:
      return <SuccessMultiTab />;

    /**
     * Already Registered tabs
     */
    case REG_TAB.ALREADY_REGISTERED_RUNNING:
      return <AlreadyRegisteredRunningTab />;
    case REG_TAB.ALREADY_REGISTERED_MULTI:
      return <AlreadyRegisteredMultiTab />;

    default:
      throw new Error(`Unknown tab: ${tab}`);
  }
}

type RegistrationProps = {
  ed25519PubKey: string;
  ed25519Signature: string;
  blsKey: string;
  blsSignature: string;
  preparedAt: Date;
};

export const getRegistrationSoloFormSchema = () =>
  z.object({
    rewardsAddress: getEthereumAddressFormFieldSchema({ required: true }),
  });

type GetMultiRegistrationFormSchemaArgs = {
  stakeAmount: GetStakeAmountFormFieldSchemaArgs;
  operatorFee: GetOperatorFeeFormFieldSchemaArgs;
};

export const getRegistrationMultiFormSchema = ({
  stakeAmount,
  operatorFee,
}: GetMultiRegistrationFormSchemaArgs) =>
  z.object({
    autoActivate: z.boolean().default(true),
    rewardsAddress: getEthereumAddressFormFieldSchema({ required: true }),
    stakeAmount: getStakeAmountFormFieldSchema(stakeAmount),
    operatorFee: getOperatorFeeFormFieldSchema(operatorFee),
    reservedContributors: z.array(
      z.object({ addr: z.custom<Address>((value) => isAddress(value)), amount: z.bigint() })
    ),
  });

export type SoloRegistrationFormSchema = z.infer<ReturnType<typeof getRegistrationSoloFormSchema>>;
export type MultiRegistrationFormSchema = z.infer<
  ReturnType<typeof getRegistrationMultiFormSchema>
>;

export function Registration({
  blsKey,
  ed25519PubKey,
  blsSignature,
  ed25519Signature,
  preparedAt,
}: RegistrationProps) {
  return (
    <RegistrationProvider
      blsKey={blsKey}
      ed25519PubKey={ed25519PubKey}
      blsSignature={blsSignature}
      ed25519Signature={ed25519Signature}
      preparedAt={preparedAt}
    >
      <RegistrationWizard />
    </RegistrationProvider>
  );
}

export function RegistrationWizard() {
  const {
    handleTabBackButtonClick,
    isSubmitting,
    isSuccess,
    nodeType,
    tab,
    tabHistory,
    formMulti,
  } = useRegistrationWizard();

  const { setIsBalanceVisible } = useWalletButton();

  const sharedDict = useTranslations('actionModules.registration.shared');
  const dict = useTabDictionary(tab);

  const decimalDelimiter = useDecimalDelimiter();
  const watchedStakeAmount = formMulti.watch('stakeAmount');
  const remainingStake = formatSENTBigIntNoRounding(
    SESSION_NODE_FULL_STAKE_AMOUNT -
      stringToBigInt(watchedStakeAmount, SENT_DECIMALS, decimalDelimiter)
  );

  const titleKey =
    tab === REG_TAB.START || tab === REG_TAB.ALREADY_REGISTERED_RUNNING
      ? 'registerANewNode'
      : nodeType === NODE_TYPE.SOLO
        ? 'singleContributorNode'
        : 'multiContributorNode';

  const title = sharedDict.has(titleKey) ? sharedDict(titleKey) : null;

  const sectionTitle = dict.has('title') ? dict('title') : null;
  const sectionDescription = dict.has('description')
    ? dict.rich('description', { remainingStake })
    : null;
  const sectionDescription2 = dict.has('description2') ? dict.rich('description2') : null;

  /** While the component is mounted, show the balance */
  useEffect(() => {
    setIsBalanceVisible(true);
    return () => setIsBalanceVisible(false);
  }, [setIsBalanceVisible]);

  return (
    <WizardContent
      title={title}
      section={{
        title: sectionTitle,
        description: sectionDescription,
        description2: sectionDescription2,
        href: REGISTRATION_LINKS[tab],
      }}
      backButton={{
        text: sharedDict('buttonBack.text'),
        aria: sharedDict('buttonBack.aria'),
        dataTestId: ButtonDataTestId.Registration_Back_Button,
        onClick: handleTabBackButtonClick,
        disabled: isSubmitting || isSuccess,
        hide:
          tabHistory.length === 0 || tab === REG_TAB.SUCCESS_SOLO || tab === REG_TAB.SUCCESS_MULTI,
      }}
    >
      {getTab(tab)}
    </WizardContent>
  );
}

export enum REGISTRATION_QUERY_PARAM {
  OPERATOR_FEE = 'operatorFee',
  AUTO_ACTIVATE = 'autoActivate',
  REWARDS_ADDRESS = 'rewardsAddress',
  STAKE_AMOUNT = 'stakeAmount',
  RESERVED_CONTRIBUTORS = 'reservedContributors',
  IS_MULTI = 'isMulti',
  MODE = 'mode',
}

function parseRegistrationQueryParams(
  params: URLSearchParams,
  schema: ReturnType<typeof getRegistrationMultiFormSchema>
) {
  const modeRaw = params.get(REGISTRATION_QUERY_PARAM.MODE);
  const mode = modeRaw && isUserSelectableRegistrationMode(modeRaw) ? modeRaw : undefined;

  const isMulti = params.get(REGISTRATION_QUERY_PARAM.IS_MULTI);
  const nodeType = isMulti ? (isMulti === 'false' ? NODE_TYPE.SOLO : NODE_TYPE.MULTI) : undefined;

  const autoActivateRaw = params.get(REGISTRATION_QUERY_PARAM.AUTO_ACTIVATE);
  const autoActivate = autoActivateRaw ? autoActivateRaw === 'false' : undefined;

  const reservedContributorsRaw = params.get(REGISTRATION_QUERY_PARAM.RESERVED_CONTRIBUTORS);
  const [parseErr, reservedContributorsParsed] = reservedContributorsRaw
    ? safeTrySync(() => JSON.parse(reservedContributorsRaw))
    : [null, null];

  if (parseErr) {
    console.error(parseErr);
  }

  let reservedContributors: Array<ReservedContributorStruct> | undefined = undefined;

  if (Array.isArray(reservedContributorsParsed)) {
    const res = reservedContributorsParsed
      .map((slot) => {
        const [err, amount] = safeTrySync(() => BigInt(slot.amount));

        if (err) {
          console.error(err);
          return null;
        }

        return { addr: slot.addr, amount };
      })
      .filter((v) => v !== null);

    if (isValidReservedSlots(res)) {
      reservedContributors = res;
    }
  }

  const data = {
    autoActivate,
    operatorFee: params.get(REGISTRATION_QUERY_PARAM.OPERATOR_FEE) ?? undefined,
    reservedContributors,
    rewardsAddress: params.get(REGISTRATION_QUERY_PARAM.REWARDS_ADDRESS) ?? undefined,
    stakeAmount: params.get(REGISTRATION_QUERY_PARAM.STAKE_AMOUNT) ?? undefined,
  };
  const zod = schema.safeParse(data);

  return { data, zod, mode, nodeType };
}
