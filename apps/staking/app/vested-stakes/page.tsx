import ComingSoonModule from '@/app/mystakes/modules/ComingSoon';
import VestingEndTimeModule from '@/app/vested-stakes/modules/VestingEndTimeModule';
import VestingInfoModule from '@/app/vested-stakes/modules/VestingInfoModule';
import VestingReturnStakesModule from '@/app/vested-stakes/modules/VestingReturnStakesModule';
import VestingStakedBalanceModule from '@/app/vested-stakes/modules/VestingStakedBalanceModule';
import VestingStakedNodesModule from '@/app/vested-stakes/modules/VestingStakedNodesModule';
import VestingUnclaimedStakesModule from '@/app/vested-stakes/modules/VestingUnclaimedStakesModule';
import VestingUnstakedBalanceModule from '@/app/vested-stakes/modules/VestingUnstakedBalanceModule';
import { ErrorBox } from '@/components/Error/ErrorBox';
import { siteMetadata } from '@/lib/metadata';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';

export async function generateMetadata() {
  const dict = await getTranslations('metadata.vestedStakes');
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
          <ComingSoonModule />
          <VestingStakedBalanceModule />
          <VestingUnstakedBalanceModule />
          <VestingEndTimeModule />
          <VestingUnclaimedStakesModule />
          <VestingReturnStakesModule />
        </ModuleGrid>
        <VestingInfoModule />
      </div>
      <div className="col-span-2 mt-6 h-full pb-8 md:mt-0 md:max-h-screen-without-header">
        <ModuleGrid variant="section" colSpan={2} className="h-full">
          <ErrorBoundary errorComponent={ErrorBox}>
            <VestingStakedNodesModule />
          </ErrorBoundary>
        </ModuleGrid>
      </div>
    </ModuleGrid>
  );
}
