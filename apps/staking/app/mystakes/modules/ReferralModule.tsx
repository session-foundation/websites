'use client';

import { Module, ModuleContent, ModuleHeader, ModuleText } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { Input } from '@session/ui/ui/input';
import { useWallet } from '@session/wallet/hooks/wallet-hooks';
import { useRef, useState } from 'react';
import { encodeAddressToHashId } from '@/lib/hashid';
import { WalletModalButtonWithLocales } from '@/components/WalletModalButtonWithLocales';
import { BASE_URL, URL } from '@/lib/constants';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { toast } from '@session/ui/lib/toast';
import { externalLink } from '@/lib/locale-defaults';
import { useQuery } from '@tanstack/react-query';
import { getReferralCodeInfo } from '@/app/faucet/actions';
import { LoadingText } from '@session/ui/components/loading-text';
import { formatSENTNumber } from '@session/contracts/hooks/SENT';

export default function ReferralModule() {
  const [hidden, setHidden] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dictionary = useTranslations('modules.referral');
  const clipboardDictionary = useTranslations('clipboard');

  const { address } = useWallet();

  const hashId = address ? encodeAddressToHashId(address) : '';
  const referralLink = address ? `${BASE_URL}/faucet/${hashId}` : `${BASE_URL}/faucet`;

  const { data, status } = useQuery({
    queryKey: ['referral', address],
    enabled: !hidden,
    queryFn: async () => {
      try {
        const res = await getReferralCodeInfo({ code: hashId });
        if (!res) throw new Error('No referral code found');
        return res;
      } catch (error) {
        toast.error('Failed to get referral code info');
        return null;
      }
    },
  });

  return (
    <Module size="lg" className="flex flex-grow">
      <ModuleHeader>
        <ModuleText>{dictionary('title')}</ModuleText>
        <p className="mt-2">
          {dictionary('description1')}
          <br />
          <br />
          {dictionary.rich('description2', { link: externalLink(URL.TESTNET_REFERRALS) })}
          <br />
          <br />
          {dictionary.rich('description3', { link: externalLink(URL.TESTNET_REFERRALS_TOS) })}
        </p>
      </ModuleHeader>
      <ModuleContent className="h-full min-h-12">
        {address ? (
          <div className="w-full">
            {!hidden && referralLink ? (
              <>
                <div className="flex w-full flex-row items-center gap-2 align-middle">
                  <Input
                    readOnly
                    ref={inputRef}
                    value={referralLink}
                    className="w-full select-all"
                    onFocus={(e) => e.target.select()}
                  />
                  <CopyToClipboardButton
                    textToCopy={referralLink}
                    data-testid={ButtonDataTestId.Copy_Referral_Link}
                    onCopyComplete={() => {
                      inputRef.current?.select();
                      toast.success(clipboardDictionary('copyToClipboardSuccessToast'));
                    }}
                  />
                </div>
                <div className="text-session-text-secondary mt-2 text-xs">
                  {status === 'success' ? (
                    dictionary.rich('description4', {
                      uses: data?.uses ?? 0,
                      remainingUses: data?.maxUses ?? 1 - (data?.uses ?? 0),
                      drip: formatSENTNumber(parseInt(data?.drip ?? '0'), 0),
                    })
                  ) : (
                    <LoadingText />
                  )}
                </div>
              </>
            ) : (
              <Button
                data-testid={ButtonDataTestId.Show_Referral_Link}
                onClick={() => setHidden(false)}
                rounded="md"
                size="lg"
              >
                {dictionary('showButton')}
              </Button>
            )}
          </div>
        ) : (
          <WalletButtonWithLocales rounded="md" size="lg" />
        )}
      </ModuleContent>
    </Module>
  );
}
