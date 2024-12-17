import { BASE_URL } from '@/lib/constants';

const SITE_TITLE = 'Session Staking Portal';
const SITE_DESCRIPTION = 'Stake and get rewarded for securing the Session Network.';
const SITE_IMAGE = `${BASE_URL}/images/link_preview.png`;
// const SITE_ICON = `${BASE_URL}/images/icon.png`;

export const siteMetadata = (props: { title?: string; description?: string; image?: string }) => {
  const { title, description = SITE_DESCRIPTION, image = SITE_IMAGE } = props;
  return {
    metadataBase: new URL('https://stake.getsession.org'),
    title: `${title ? `${title} | ` : ''}${SITE_TITLE}`,
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
