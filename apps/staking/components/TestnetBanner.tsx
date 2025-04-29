import { SpecialDataTestId } from '@/testing/data-test-ids';
import { Banner } from '@session/ui/components/Banner';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function TestnetBanner() {
  const dict = await getTranslations('chainBanner');

  return (
    <Banner>
      <span>
        {dict.rich('testnet', {
          link: (chunks) => (
            <Link
              target="_blank"
              data-testid={SpecialDataTestId.Mainnet_Link}
              href="https://stake.getsession.org/"
              className="font-medium underline"
            >
              {chunks}
            </Link>
          ),
        })}
      </span>
    </Banner>
  );
}
