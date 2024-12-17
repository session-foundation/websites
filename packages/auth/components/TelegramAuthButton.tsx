'use client';

import { Button } from '@session/ui/ui/button';
import { LoginButton } from '@telegram-auth/react';
import { SignInAuthorizationParams } from 'next-auth/react';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { TelegramIcon } from '../icons/TelegramIcon';
import { signIn, signOut, useSession } from '../lib/client';
import { ButtonDataTestId } from '../testing/data-test-ids';

type TelegramAuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  locale?: string;
};

export const TelegramAuthButton = forwardRef<HTMLButtonElement, TelegramAuthButtonProps>(
  ({ locale, ...props }, ref) => {
    const { data, status } = useSession();

    const isConnected = status === 'authenticated';
    /** @ts-expect-error -- username exists */
    const username = data?.user?.username ?? data?.user?.name;

    const handleAuth = (data: unknown) => {
      if (!isConnected && data) {
        void signIn('telegram', {}, data as SignInAuthorizationParams);
      } else {
        void signOut();
      }
    };

    return (
      <div className="group relative w-full overflow-hidden rounded-md">
        {!isConnected ? (
          <div
            className="absolute w-full scale-150"
            style={{
              transform: 'scaleX(4)',
              zIndex: '50',
              // NOTE: This is a workaround to make the iframe almost invisible as opacity: 0 doesn't work
              opacity: '0.001',
            }}
          >
            <LoginButton
              botUsername="session_testnet_bot"
              onAuthCallback={handleAuth}
              buttonSize="large"
              cornerRadius={0}
              lang={locale}
            />
          </div>
        ) : null}
        <Button
          className="text-session-black hover:text-session-black w-full gap-2 border-transparent bg-[#2AABEE] px-2 uppercase hover:bg-[#2AABEE] group-hover:brightness-125"
          rounded="md"
          size="lg"
          data-testid={ButtonDataTestId.TELEGRAM_AUTH}
          {...(isConnected ? { onClick: handleAuth } : {})}
          ref={ref}
          {...props}
        >
          <TelegramIcon className="h-5 w-5" />
          {isConnected ? `Connected To ${username ?? 'Telegram'}` : 'Connect Telegram'}
        </Button>
      </div>
    );
  }
);
