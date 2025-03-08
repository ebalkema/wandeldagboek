/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/wandeldagboekv1',
  images: {
    unoptimized: true,
  },
  // Zorg ervoor dat de app weet dat het op GitHub Pages draait
  assetPrefix: '/wandeldagboekv1',
};

module.exports = nextConfig; 