import OpenNodes from "@/app/stake/OpenNodes";
import { ErrorBox } from "@/components/Error/ErrorBox";
import NodesListModule, {
  NodesListSkeleton,
} from "@/components/NodesListModule";
import { getContributionContracts } from "@/lib/queries/getContributionContracts";
import { stakingBackendPrefetchQuery } from "@/lib/staking-api-server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

export default async function OpenNodesModule() {
  const dictionary = await getTranslations("modules.openNodes");
  const { queryClient } = stakingBackendPrefetchQuery(getContributionContracts);

  return (
    <NodesListModule title={dictionary("title")}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NodesListSkeleton />}>
          <ErrorBoundary errorComponent={ErrorBox}>
            <OpenNodes />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </NodesListModule>
  );
}
