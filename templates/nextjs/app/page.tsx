import Typography from '@session/ui/components/Typography';
import { getTranslations } from 'next-intl/server';

export default async function LandingPage() {
  const dict = await getTranslations('landing');
  return <Typography variant="h1">{dict('title')}</Typography>;
}
