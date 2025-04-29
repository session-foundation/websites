import StakedBalanceModule from '@/app/mystakes/modules/StakedBalanceModule';
import { StakedNodesWithAddress } from '@/app/mystakes/modules/StakedNodesModule';
import TotalRewardsModule from '@/app/mystakes/modules/TotalRewardsModule';
import UnclaimedRewardsModule from '@/app/mystakes/modules/UnclaimedRewardsModule';
import UnclaimedStakesModule from '@/app/mystakes/modules/UnclaimedStakesModule';
import UnlockingStakesModule from '@/app/mystakes/modules/UnlockingStakesModule';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import { notFound } from 'next/navigation';
import { isAddress } from 'viem';

export function AddressInfo({ address }: { address: string }) {
  return isAddress(address) ? (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 self-center">
      <ModuleGrid>
        <StakedBalanceModule addressOverride={address} />
        <TotalRewardsModule addressOverride={address} />
        <UnlockingStakesModule addressOverride={address} />
        <UnclaimedRewardsModule addressOverride={address} />
        <UnclaimedStakesModule addressOverride={address} />
      </ModuleGrid>
      <StakedNodesWithAddress address={address} />
    </div>
  ) : (
    notFound()
  );
}
