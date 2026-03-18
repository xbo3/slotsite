/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fan-cdn.nolimitcity.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pgsoft.com',
      },
    ],
  },
};

export default nextConfig;
