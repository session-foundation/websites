'use client';
import { use } from 'react';

import { Faucet } from '@/app/faucet/Faucet';

interface FaucetCodePageParams {
  params: Promise<{
    code: string;
  }>;
}

export default function FaucetCodePage(props: FaucetCodePageParams) {
  const params = use(props.params);
  const { code } = params;
  return <Faucet code={code} />;
}
