import createNextIntlPlugin from 'next-intl/plugin';
import withPlaiceholder from '@plaiceholder/next';

const withNextIntl = createNextIntlPlugin('./lib/locale-server.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@session/ui',
    '@session/util-js',
    '@session/util-logger',
    '@session/sanity-cms',
  ],
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty'],
    taint: true,
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        // cdn.sanity.io serves every Sanity project's uploads, so only our project's images may reach the optimizer.
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/**`,
      },
    ],
  },
  async rewrites() {
    return [
      ...[
        '/rss',
        '/feed',
        '/feed.xml',
        '/blog.xml',
        '/blog/rss',
        '/blog/feed',
        '/blog/rss.xml',
        '/blog/feed.xml',
      ].map((source) => ({
        source,
        destination: '/rss.xml',
      })),
    ];
  },
};

export default withNextIntl(withPlaiceholder(nextConfig));
