import { ActionModulePage } from '@/components/ActionModule';
import { siteMetadata } from '@/lib/metadata';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const dict = await getTranslations('metadata.register');
  return siteMetadata({
    title: dict('title'),
    description: dict('description'),
  });
}

export default function Page() {
  const dictionary = useTranslations('modules.nodeRegistrations');
  return (
    <ActionModulePage>
      <p>{dictionary('landingP1')}</p>
    </ActionModulePage>
  );
}
