import PriceModule from '@/app/mystakes/modules/PriceModule';
import UnclaimedRewardsModule from '@/app/mystakes/modules/UnclaimedRewardsModule';
import UnclaimedStakesModule from '@/app/mystakes/modules/UnclaimedStakesModule';
import UnlockingStakesModule from '@/app/mystakes/modules/UnlockingStakesModule';
import { ErrorBox } from '@/components/Error/ErrorBox';
import { siteMetadata } from '@/lib/metadata';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import ClaimTokensModule from './modules/ClaimTokensModule';
import DailyNodeReward from './modules/DailyNodeReward';
import StakedBalanceModule from './modules/StakedBalanceModule';
import StakedNodesModule from './modules/StakedNodesModule';
import TotalRewardsModule from './modules/TotalRewardsModule';

export async function generateMetadata() {
  const dict = await getTranslations('metadata.myStakes');
  return siteMetadata({
    title: dict('title'),
    description: dict('description'),
  });
}

export default function Page() {
  return (
    <ModuleGrid size="lg" className="h-full px-4 md:px-10 xl:auto-rows-auto">
      <div className="col-span-1 flex h-full min-h-max flex-col gap-4 pb-8 md:max-h-screen-without-header md:overflow-y-auto md:overflow-x-hidden">
        <ModuleGrid className="mr-1">
          <StakedBalanceModule />
          <DailyNodeReward />
          <TotalRewardsModule />
          <UnlockingStakesModule />
          <UnclaimedRewardsModule />
          <UnclaimedStakesModule />
          <ClaimTokensModule />
        </ModuleGrid>
        <PriceModule />
      </div>
      <div className="col-span-2 mt-6 h-full pb-8 md:mt-0 md:max-h-screen-without-header">
        <ModuleGrid variant="section" colSpan={2} className="h-full">
          <ErrorBoundary errorComponent={ErrorBox}>
            <StakedNodesModule />
          </ErrorBoundary>
        </ModuleGrid>
      </div>
    </ModuleGrid>
  );
}
