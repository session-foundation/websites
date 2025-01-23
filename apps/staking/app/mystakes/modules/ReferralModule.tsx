'use client';

import { Module, ModuleContent, ModuleHeader, ModuleText } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { Input } from '@session/ui/ui/input';
import { useRef, useState } from 'react';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { encodeAddressToHashId } from '@/lib/hashid';
import { WalletButtonWithLocales } from '@/components/WalletButtonWithLocales';
import { BASE_URL, URL } from '@/lib/constants';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { toast } from '@session/ui/lib/toast';
import { externalLink } from '@/lib/locale-defaults';
import { useQuery } from '@tanstack/react-query';
import { getReferralCodeInfo } from '@/app/faucet/actions';
import { LoadingText } from '@session/ui/components/loading-text';
import { formatSENTNumber } from '@session/contracts/hooks/Token';

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
        return await getReferralCodeInfo({ code: hashId });
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
                {status === 'success' ? (
                  data ? (
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
                  ) : (
                    <span className="text-destructive text-base">
                      This wallet is not eligible for a referral code
                    </span>
                  )
                ) : (
                  <LoadingText />
                )}
                <div className="text-session-text-secondary mt-2 text-xs">
                  {status === 'success' ? (
                    data ? (
                      dictionary.rich('description4', {
                        uses: data?.uses ?? 0,
                        remainingUses: (data?.maxUses ?? 1) - (data?.uses ?? 0),
                        drip: formatSENTNumber(parseInt(data?.drip ?? '0'), 0),
                      })
                    ) : null
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
