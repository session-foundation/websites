import StakedBalanceModule from '@/app/mystakes/modules/StakedBalanceModule';
import { StakedNodesWithAddress } from '@/app/mystakes/modules/StakedNodesModule';
import TotalRewardsModule from '@/app/mystakes/modules/TotalRewardsModule';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import { notFound } from 'next/navigation';
import { isAddress } from 'viem';

export function AddressInfo({ address }: { address: string }) {
  return isAddress(address) ? (
    <div className="mx-auto flex w-full min-w-4xl max-w-4xl flex-col gap-4 self-center overflow-y-auto">
      <ModuleGrid className="md:p-6">
        <StakedBalanceModule addressOverride={address} size="default" variant="default" />
        <TotalRewardsModule addressOverride={address} size="default" />
      </ModuleGrid>
      <StakedNodesWithAddress address={address} scopeId={`addressList.${address}`} />
    </div>
  ) : (
    notFound()
  );
}
