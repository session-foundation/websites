import { AuthModule } from '@/app/faucet/AuthModule';
import { COMMUNITY_DATE } from '@/lib/constants';
import { formatDate } from '@/lib/locale-client';
import { NextAuthProvider } from '@session/auth/client';
import { useTranslations } from 'next-intl';

export function Faucet({ code }: { code?: string }) {
  const dictionary = useTranslations('faucet.information');
  return (
    <NextAuthProvider>
      <div className="lg:-mt-header-displacement mx-auto flex w-screen max-w-screen-3xl flex-col-reverse items-center justify-around gap-16 px-4 py-16 align-middle xl:grid xl:h-dvh xl:grid-cols-2 xl:p-32 xl:py-0">
        <div className="flex h-max flex-col gap-4 text-start">
          <h1 className="font-semibold text-5xl">{dictionary('title')}</h1>
          <h2 className="font-semibold text-lg">{dictionary('referralTitle')}</h2>
          <p>{dictionary('referralDescription')}</p>
          {/*<h2 className="text-lg font-semibold">{dictionary('communityTitle')}</h2>*/}
          {/*<p>*/}
          {/*  {dictionary.rich('communityDescription', {*/}
          {/*    connectionOptions: formatList(['Discord', 'Telegram']),*/}
          {/*    snapshotDate: formatDate(new Date(COMMUNITY_DATE.SESSION_TOKEN_COMMUNITY_SNAPSHOT), {*/}
          {/*      dateStyle: 'long',*/}
          {/*    }),*/}
          {/*  })}*/}
          {/*</p>*/}
          <h2 className="font-semibold text-lg">{dictionary('oxenTitle')}</h2>
          <p>
            {dictionary.rich('oxenDescription', {
              oxenRegistrationDate: formatDate(
                new Date(COMMUNITY_DATE.OXEN_SERVICE_NODE_BONUS_PROGRAM),
                {
                  dateStyle: 'long',
                }
              ),
            })}
          </p>
          <p>{dictionary('notEligible')}</p>
          <h2 className="font-semibold text-lg">{dictionary('walletRequirementTitle')}</h2>
          <p>{dictionary.rich('walletRequirementDescription')}</p>
        </div>
        <div className="mt-6 flex h-max min-h-[400px] w-full max-w-xl flex-col items-center justify-center">
          <AuthModule code={code} />
        </div>
      </div>
    </NextAuthProvider>
  );
}
