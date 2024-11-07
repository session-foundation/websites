'use client';

import { Faucet } from '@/app/faucet/Faucet';

interface FaucetCodePageParams {
  params: {
    code: string;
  };
}

export default function FaucetCodePage({ params }: FaucetCodePageParams) {
  const { code } = params;
  return <Faucet code={code} />;
}
