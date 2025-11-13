/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/applications',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

