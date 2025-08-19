import StakedBalanceModule from '@/app/mystakes/modules/StakedBalanceModule';
import { StakedNodesForAddress } from '@/app/mystakes/modules/StakedNodesModule';
import TotalRewardsModule from '@/app/mystakes/modules/TotalRewardsModule';
import { ModuleGrid } from '@session/ui/components/ModuleGrid';
import { isEthereumAddress } from '@session/util-crypto/keys';
import { notFound } from 'next/navigation';

export function AddressInfo({ address }: { address: string }) {
  return isEthereumAddress(address) ? (
    <div className="mx-auto flex w-full min-w-4xl max-w-4xl flex-col gap-4 self-center overflow-y-auto">
      <ModuleGrid className="md:p-6">
        <StakedBalanceModule addressOverride={address} size="default" variant="default" />
        <TotalRewardsModule addressOverride={address} size="default" />
      </ModuleGrid>
      <StakedNodesForAddress address={address} scopeId={`addressList.${address}`} hideButtons />
    </div>
  ) : (
    notFound()
  );
}
