import { getContractErrorName } from '@session/contracts';
import { formatSENTNumber } from '@session/contracts/hooks/Token';
import type {
  GenericContractStatus,
  WriteContractStatus,
} from '@session/contracts/hooks/useContractWriteQuery';
import type { StakeContributor } from '@session/staking-api-js/client';
import { toast } from '@session/ui/lib/toast';
import { PROGRESS_STATUS } from '@session/ui/motion/progress';
import type { useTranslations } from 'next-intl';
import type {
  SimulateContractErrorType,
  TransactionExecutionErrorType,
  WriteContractErrorType,
} from 'viem';

/**
 * Formats a localized contract error message based on the error type and the dictionary.
 * @param dictionary - The dictionary to use for localization.
 * @param dictGeneral - The general dictionary to use for localization.
 * @param errorGroupDictKey - The error group dictionary key to use for localization.
 * @param error - The error to format.
 * @returns The formatted error message.
 */
export const formatLocalizedContractErrorMessage = ({
  dict,
  dictGeneral,
  errorGroupDictKey,
  error,
}: {
  dict: ReturnType<typeof useTranslations>;
  dictGeneral: ReturnType<typeof useTranslations<'general'>>;
  errorGroupDictKey: string;
  error: Error | SimulateContractErrorType | WriteContractErrorType | TransactionExecutionErrorType;
}) => {
  const parsedName = getContractErrorName(error);
  const dictKey = `${errorGroupDictKey}.errors.${parsedName}`;

  /** @ts-expect-error -- the `.has` check makes this fine */
  let reason = dict.has(dictKey) ? dict(dictKey) : null;

  if (!reason) {
    /** @ts-expect-error -- the `.has` check makes this fine */
    reason = dictGeneral.has(`error.${parsedName}`) ? dictGeneral(`error.${parsedName}`) : null;
  }

  if (!reason) {
    reason = parsedName;
  }

  /** @ts-expect-error -- This key should exist, but this logs an error and returns the key if it doesn't */
  return dict(`${errorGroupDictKey}.errorTemplate`, { reason });
};

/**
 * Formats a localized contract error messages based on the error types and the dictionary. This issued for all contract errors from a single contract lifecycle.
 * @param dict - The dictionary to use for localization.
 * @param dictGeneral - The general dictionary to use for localization.
 * @param errorGroupDictKey - The error group dictionary key to use for localization.
 * @param simulateError - The simulate error to format.
 * @param writeError - The write error to format.
 * @param transactionError - The transaction error to format.
 * @returns The formatted error message.
 */
export const formatAndHandleLocalizedContractErrorMessages = ({
  dict,
  dictGeneral,
  errorGroupDictKey,
  simulateError,
  writeError,
  transactionError,
}: {
  dict: ReturnType<typeof useTranslations>;
  dictGeneral: ReturnType<typeof useTranslations<'general'>>;
  errorGroupDictKey: string;
  simulateError?: SimulateContractErrorType | Error | null;
  writeError?: WriteContractErrorType | Error | null;
  transactionError?: TransactionExecutionErrorType | Error | null;
}) => {
  if (simulateError) {
    toast.handleError(simulateError);
    return formatLocalizedContractErrorMessage({
      dict,
      dictGeneral,
      errorGroupDictKey,
      error: simulateError,
    });
  }

  if (writeError) {
    toast.handleError(writeError);
    return formatLocalizedContractErrorMessage({
      dict,
      dictGeneral,
      errorGroupDictKey,
      error: writeError,
    });
  }

  if (transactionError) {
    toast.handleError(transactionError);
    return formatLocalizedContractErrorMessage({
      dict,
      dictGeneral,
      errorGroupDictKey,
      error: transactionError,
    });
  }
  return dictGeneral('unknownError');
};

/**
 * Parses the contract status to a progress status.
 * @param contractStatus - The contract status to parse.
 * @returns The progress status.
 * {@link PROGRESS_STATUS}
 */
export const parseContractStatusToProgressStatus = (
  contractStatus: GenericContractStatus | WriteContractStatus
) => {
  switch (contractStatus) {
    case 'error':
      return PROGRESS_STATUS.ERROR;

    case 'pending':
      return PROGRESS_STATUS.PENDING;

    case 'success':
      return PROGRESS_STATUS.SUCCESS;

    default:
      return PROGRESS_STATUS.IDLE;
  }
};

export const formattedTotalStakedInContract = (contributors: Array<StakeContributor>) => {
  return formatSENTNumber(
    contributors.reduce((acc, { amount }) => {
      return acc + amount;
    }, 0)
  );
};
