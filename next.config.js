/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/wandeldagboek',
  images: {
    unoptimized: true,
  },
  // Zorg ervoor dat de app weet dat het op GitHub Pages draait
  assetPrefix: '/wandeldagboek',
  trailingSlash: true,
};

module.exports = nextConfig; 