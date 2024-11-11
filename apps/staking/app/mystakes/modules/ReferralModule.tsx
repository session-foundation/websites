'use client';

import { Module, ModuleContent, ModuleHeader, ModuleText } from '@session/ui/components/Module';
import { useTranslations } from 'next-intl';
import { Input } from '@session/ui/ui/input';
import { useMemo, useRef, useState } from 'react';
import { useWallet } from '@session/wallet/hooks/wallet-hooks';
import { encodeAddressToHashId } from '@/lib/hashid';
import { WalletModalButtonWithLocales } from '@/components/WalletModalButtonWithLocales';
import { BASE_URL, URL } from '@/lib/constants';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { ButtonDataTestId, LinkDataTestId } from '@/testing/data-test-ids';
import { Button } from '@session/ui/ui/button';
import { toast } from '@session/ui/lib/toast';
import { externalLink } from '@/lib/locale-defaults';

export default function ReferralModule() {
  const [hidden, setHidden] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dictionary = useTranslations('modules.referral');
  const clipboardDictionary = useTranslations('clipboard');

  const { address } = useWallet();

  const referralLink = useMemo(() => {
    if (!address) return null;
    const hashId = encodeAddressToHashId(address);
    return `${BASE_URL}/faucet/${hashId}`;
  }, [address]);

  return (
    <Module size="lg" className="flex flex-grow">
      <ModuleHeader>
        <ModuleText>{dictionary('title')}</ModuleText>
        <p className="mt-2">
          {dictionary('description1')}
          <br />
          <br />
          {dictionary.rich('description2', {
            link: externalLink({
              href: URL.TESTNET_REFERRALS,
              dataTestId: LinkDataTestId.Paragraph_Testnet_Referral,
            }),
          })}
          <br />
          <br />
          {dictionary.rich('description3', {
            link: externalLink({
              href: URL.TESTNET_REFERRALS_TOS,
              dataTestId: LinkDataTestId.Paragraph_Testnet_Referral_ToS,
            }),
          })}
        </p>
      </ModuleHeader>
      <ModuleContent className="h-full min-h-12">
        {address ? (
          <div className="w-full">
            {!hidden && referralLink ? (
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
          <WalletModalButtonWithLocales rounded="md" size="lg" />
        )}
      </ModuleContent>
    </Module>
  );
}
