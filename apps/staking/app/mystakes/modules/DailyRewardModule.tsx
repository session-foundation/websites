'use client';

import DailyNodeReward from '@/app/mystakes/modules/DailyNodeReward';
import DailyRewardsModule from '@/app/mystakes/modules/DailyRewardsModule';
import { useCurrentActor } from '@/hooks/useCurrentActor';

export default function DailyRewardModule() {
  const address = useCurrentActor();
  return address ? <DailyRewardsModule /> : <DailyNodeReward />;
}
