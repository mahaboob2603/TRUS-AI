/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  // Removed redirect to show welcome page
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/applications',
  //       permanent: false,
  //     },
  //   ];
  // },
};

export default nextConfig;

