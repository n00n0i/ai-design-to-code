/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  assetPrefix: process.env.ASSET_PREFIX || '',
};

export default nextConfig;
