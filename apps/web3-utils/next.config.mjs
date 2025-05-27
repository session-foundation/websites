import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/locale-server.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@session/ui',
    '@session/wallet',
    '@session/contracts',
    '@session/util-js',
    '@session/util-crypto',
    '@session/util-logger',
    '@session/feature-flags',
    'better-sqlite3-multiple-ciphers',
  ],
  serverExternalPackages: ['pino', 'pino-pretty'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    if (process.env.NO_MINIFY?.toLowerCase() === 'true') {
      config.optimization = {
        minimize: false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
