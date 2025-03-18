import ComingSoonModule from '@/app/mystakes/modules/ComingSoon';
import PriceModule from '@/app/mystakes/modules/PriceModule';
import TestnetPointsModule from '@/app/mystakes/modules/TestnetPointsModule';
import { siteMetadata } from '@/lib/metadata';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import { getTranslations } from 'next-intl/server';
import ClaimTokensModule from './modules/ClaimTokensModule';
import DailyNodeReward from './modules/DailyNodeReward';
import StakedBalanceModule from './modules/StakedBalanceModule';
import StakedNodesModule from './modules/StakedNodesModule';
import TotalRewardsModule from './modules/TotalRewardsModule';
import UnclaimedTokensModule from './modules/UnclaimedTokensModule';

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
          <ComingSoonModule />
          <TotalRewardsModule />
          <UnclaimedTokensModule />
          <TestnetPointsModule />
          <ClaimTokensModule />
        </ModuleGrid>
        <PriceModule />
      </div>
      <div className="col-span-2 mt-6 h-full pb-8 md:mt-0 md:max-h-screen-without-header">
        <ModuleGrid variant="section" colSpan={2} className="h-full">
          <StakedNodesModule />
        </ModuleGrid>
      </div>
    </ModuleGrid>
  );
}
