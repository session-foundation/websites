"use client";

import { ModuleDynamicContractReadText } from "@/components/ModuleDynamic";
import useDailyNodeReward from "@/hooks/useDailyNodeReward";
import { DYNAMIC_MODULE, URL } from "@/lib/constants";
import { externalLink } from "@/lib/locale-defaults";
import { LinkDataTestId } from "@/testing/data-test-ids";
import { formatSENTBigInt } from "@session/contracts/hooks/Token";
import {
  Module,
  ModuleTitleDynamic,
  ModuleTooltip,
} from "@session/ui/components/Module";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function DailyNodeReward() {
  const { dailyNodeReward, status, refetch } = useDailyNodeReward();
  const dictionary = useTranslations("modules.dailyRewards");
  const dictionaryShared = useTranslations("modules.shared");
  const toastDictionary = useTranslations("modules.toast");
  const titleFormat = useTranslations("modules.title");

  const title = dictionary("title");
  const titleShort = dictionary("titleShort");

  const formattedDailyNodeRewardAmount = useMemo(
    () =>
      `${formatSENTBigInt(
        dailyNodeReward ?? BigInt(0),
        DYNAMIC_MODULE.SENT_ROUNDED_DECIMALS
      )}`,
    [dailyNodeReward]
  );

  return (
    <Module>
      <ModuleTooltip>
        {dictionary.rich("description", {
          link: externalLink({
            href: URL.LEARN_MORE_DAILY_REWARDS,
            dataTestId: LinkDataTestId.Daily_Node_Reward_Tooltip,
          }),
        })}
      </ModuleTooltip>
      <ModuleTitleDynamic
        longText={titleFormat("format", { title })}
        shortText={titleFormat("format", { title: titleShort })}
      />
      <ModuleDynamicContractReadText
        status={status}
        fallback={0}
        enabled
        errorFallback={dictionaryShared("error")}
        errorToast={{
          messages: {
            error: toastDictionary("error", { module: title }),
            refetching: toastDictionary("refetching"),
            success: toastDictionary("refetchSuccess", { module: title }),
          },
          refetch,
        }}
      >
        {formattedDailyNodeRewardAmount}
      </ModuleDynamicContractReadText>
    </Module>
  );
}
