import { BASE_URL } from '@/lib/constants';
import { getTranslations } from 'next-intl/server';

const SITE_IMAGE = `${BASE_URL}/images/link_preview.png`;
// const SITE_ICON = `${BASE_URL}/images/icon.png`;

export const siteMetadata = async (props: {
  title?: string;
  description?: string;
  image?: string;
}) => {
  const dict = await getTranslations('metadata.root');
  const { title, description = dict('description'), image = SITE_IMAGE } = props;
  return {
    metadataBase: new URL('https://stake.getsession.org'),
    title: `${title ? `${title} | ` : ''}${dict('title')}`,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
  };
};
