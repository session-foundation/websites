import { isAddress } from 'viem';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import StakedBalanceModule from '@/app/mystakes/modules/StakedBalanceModule';
import TotalRewardsModule from '@/app/mystakes/modules/TotalRewardsModule';
import UnclaimedTokensModule from '@/app/mystakes/modules/UnclaimedTokensModule';
import { StakedNodesWithAddress } from '@/app/mystakes/modules/StakedNodesModule';
import { notFound } from 'next/navigation';

export function AddressInfo({ address }: { address: string }) {
  return isAddress(address) ? (
    <div className="flex flex-col gap-4">
      <ModuleGrid>
        <StakedBalanceModule addressOverride={address} />
        <TotalRewardsModule addressOverride={address} />
        <UnclaimedTokensModule addressOverride={address} />
      </ModuleGrid>
      <StakedNodesWithAddress address={address} />
    </div>
  ) : (
    notFound()
  );
}
