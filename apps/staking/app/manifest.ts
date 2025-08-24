import { siteMetadata } from '@/lib/metadata';
import type { MetadataRoute } from 'next';

export default async function manifest(): Promise<MetadataRoute.Manifest & { iconPath: string }> {
  const metadata = await siteMetadata({});
  return {
    name: metadata.title,
    short_name: metadata.openGraph.title,
    description: metadata.description,
    start_url: '.',
    display: 'standalone',
    background_color: '#1B1B1B',
    theme_color: '#00f782',
    iconPath: '/images/icon.svg',
    icons: [
      {
        src: '/images/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
