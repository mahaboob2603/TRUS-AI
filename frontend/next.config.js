/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

module.exports = nextConfig;

