import { useTranslations } from 'next-intl';
import { NextAuthProvider } from '@session/auth/client';
import { formatDate, formatList } from '@/lib/locale-client';
import { COMMUNITY_DATE } from '@/lib/constants';
import { AuthModule } from '@/app/faucet/AuthModule';

export function Faucet({ code }: { code?: string }) {
  const dictionary = useTranslations('faucet.information');
  return (
    <NextAuthProvider>
      <div className="lg:-mt-header-displacement max-w-screen-3xl mx-auto flex w-screen flex-col-reverse items-center justify-around gap-16 px-4 py-16 align-middle xl:grid xl:h-dvh xl:grid-cols-2 xl:p-32 xl:py-0">
        <div className="flex h-max flex-col gap-4 text-start">
          <h1 className="text-5xl font-semibold">{dictionary('title')}</h1>
          <h2 className="text-lg font-semibold">{dictionary('referralTitle')}</h2>
          <p>{dictionary('referralDescription')}</p>
          <h2 className="text-lg font-semibold">{dictionary('communityTitle')}</h2>
          <p>
            {dictionary.rich('communityDescription', {
              connectionOptions: formatList(['Discord', 'Telegram']),
              snapshotDate: formatDate(new Date(COMMUNITY_DATE.SESSION_TOKEN_COMMUNITY_SNAPSHOT), {
                dateStyle: 'long',
              }),
            })}
          </p>
          <h2 className="text-lg font-semibold">{dictionary('oxenTitle')}</h2>
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
          <h2 className="text-lg font-semibold">{dictionary('walletRequirementTitle')}</h2>
          <p>{dictionary.rich('walletRequirementDescription')}</p>
        </div>
        <div className="mt-6 h-max min-h-[400px] w-full max-w-3xl">
          <AuthModule code={code} />
        </div>
      </div>
    </NextAuthProvider>
  );
}
