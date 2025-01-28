import { siteMetadata } from '@/lib/metadata';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import BalanceModule from './modules/BalanceModule';
import ClaimTokensModule from './modules/ClaimTokensModule';
import DailyNodeReward from './modules/DailyNodeReward';
import StakedNodesModule from './modules/StakedNodesModule';
import TotalRewardsModule from './modules/TotalRewardsModule';
import UnclaimedTokensModule from './modules/UnclaimedTokensModule';
import TestnetPointsModule from '@/app/mystakes/modules/TestnetPointsModule';
import ComingSoonModule from '@/app/mystakes/modules/ComingSoon';
import PriceModule from '@/app/mystakes/modules/PriceModule';

export async function generateMetadata() {
  return siteMetadata({
    title: 'My Stakes',
    description: 'View your Session stakes and claim rewards.',
  });
}

export default function Page() {
  return (
    <ModuleGrid size="lg" className="h-full px-4 md:px-10 xl:auto-rows-auto">
      <div className="md:max-h-screen-without-header col-span-1 flex h-full min-h-max flex-col gap-4 pb-8 md:overflow-y-auto md:overflow-x-hidden">
        <ModuleGrid className="mr-1">
          <BalanceModule />
          <ComingSoonModule />
          <UnclaimedTokensModule />
          <TotalRewardsModule />
          <DailyNodeReward />
          <TestnetPointsModule />
          <ClaimTokensModule />
        </ModuleGrid>
        <PriceModule />
      </div>
      <div className="md:max-h-screen-without-header col-span-2 mt-6 h-full pb-8 md:mt-0">
        <ModuleGrid variant="section" colSpan={2} className="h-full">
          <StakedNodesModule />
        </ModuleGrid>
      </div>
    </ModuleGrid>
  );
}
