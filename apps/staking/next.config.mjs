import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/locale-server.ts');

const isTestnet = process.env.NEXT_PUBLIC_TESTNET === 'true';
if (isTestnet) console.log('Building staking portal in TESTNET mode!');

const getBackendApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error('NEXT_PUBLIC_BACKEND_API_URL is not set');

  if (url.endsWith('/')) {
    url = url.substring(0, url.length - 1);
  }

  console.log('Staking Backend API URL:', url);

  return url;
};

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
  redirects: async () => {
    return [
      {
        source: '/explorer/arbitrum/:path*',
        destination: `https://${isTestnet ? 'sepolia.': ''}arbiscan.io/:path*`,
        permanent: false,
      },
      {
        source: '/support',
        destination: 'https://discord.gg/sessiontoken',
        permanent: false,
      },
      {
        source: '/bridge/arbitrum',
        destination:
          `https://bridge.arbitrum.io/?destinationChain=arbitrum-${isTestnet ? 'sepolia' : 'one'}&sourceChain=${isTestnet ? 'sepolia' : 'ethereum'}`,
        permanent: false,
      },
      {
        source: '/bridge/ethereum',
        destination:
          `https://bridge.arbitrum.io/?destinationChain=${isTestnet ? 'sepolia':'ethereum'}&sourceChain=arbitrum-${isTestnet ? 'sepolia' : 'one'}`,
        permanent: false,
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: '/api/ssb/:path*',
        destination: `${getBackendApiUrl()}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
