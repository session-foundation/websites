'use client';

import WalletButtonWithLocales from '@/components/WalletButtonWithLocales';
import { WalletInteractionButtonWithLocales } from '@/components/WalletInteractionButtonWithLocales';
import { CopyToClipboardButton } from '@session/ui/components/CopyToClipboardButton';
import { PubKey } from '@session/ui/components/PubKey';
import Typography from '@session/ui/components/Typography';
import { toast } from '@session/ui/lib/toast';
import { Textarea } from '@session/ui/ui/textarea';
import { useSignMessage } from '@session/wallet/hooks/useSignMessage';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function LandingPage() {
  const [value, setValue] = useState('');
  const [signedValue, setSignedValue] = useState('');
  const [dataSignature, setDataSignature] = useState<string | null>(null);

  const dict = useTranslations('sign');

  const { address } = useWallet();

  const { signMessage, isPending } = useSignMessage({
    mutation: {
      onMutate: (value) => {
        if (!value?.message) {
          throw new Error('You need to enter some data to sign!');
        }
      },
      onError: (err) => {
        toast.handleError(err);
      },
      onSuccess: (signature) => {
        setDataSignature(signature);
        setSignedValue(value);
        toast.success('Message signed!');
      },
    },
  });

  const handleClick = () => {
    signMessage({ message: value });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <Typography variant="h1">{dict('title')}</Typography>
      <Typography variant="h3">
        {dict('signingWith')}{' '}
        {address ? <PubKey pubKey={address} /> : <WalletButtonWithLocales size="sm" />}
      </Typography>
      <div className="flex flex-col gap-4">
        <Typography variant="h3" className="flex gap-2">
          {dict('dataToSign')}{' '}
          <CopyToClipboardButton textToCopy={value} data-testid="button:copy-data-to-clipboard" />
        </Typography>
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
        <WalletInteractionButtonWithLocales
          variant="default"
          rounded="md"
          size="lg"
          aria-label={dict('buttonAriaLabel')}
          className="w-full"
          data-testid="button:sign-data"
          disabled={isPending || !value || value === signedValue}
          onClick={handleClick}
        >
          {dict('buttonSignData')}
        </WalletInteractionButtonWithLocales>
        {dataSignature ? (
          <div className="flex flex-col gap-4">
            <Typography variant="h3" className="flex gap-2">
              {dict('generatedSignature')}{' '}
              <CopyToClipboardButton
                textToCopy={dataSignature}
                data-testid="button:copy-data-signature-to-clipboard"
              />
            </Typography>
            <Textarea value={dataSignature} readOnly />
          </div>
        ) : null}
      </div>
    </div>
  );
}
