'use client';

import { getReferralCodeInfo } from '@/app/faucet/actions';
import { WalletButtonWithLocales } from '@/components/WalletButtonWithLocales';
import { BASE_URL, URL } from '@/lib/constants';
import { encodeAddressToHashId } from '@/lib/hashid';
import { externalLink } from '@/lib/locale-defaults';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { formatSENTNumber } from '@session/contracts/hooks/Token';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { Module, ModuleContent, ModuleHeader, ModuleText } from '@session/ui/components/Module';
import { LoadingText } from '@session/ui/components/loading-text';
import { toast } from '@session/ui/lib/toast';
import { Button } from '@session/ui/ui/button';
import { Input } from '@session/ui/ui/input';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is fine
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
      } catch (_error) {
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
                    <span className="text-base text-destructive">
                      This wallet is not eligible for a referral code
                    </span>
                  )
                ) : (
                  <LoadingText />
                )}
                <div className="mt-2 text-session-text-secondary text-xs">
                  {status === 'success' ? (
                    data ? (
                      dictionary.rich('description4', {
                        uses: data?.uses ?? 0,
                        remainingUses: (data?.maxUses ?? 1) - (data?.uses ?? 0),
                        drip: formatSENTNumber(Number.parseInt(data?.drip ?? '0'), 0),
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
