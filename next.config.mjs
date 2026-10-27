/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/emi-calculator', destination: '/home-loan#emi-calculator', permanent: true },
      { source: '/projects', destination: '/properties', permanent: true },
      { source: '/services', destination: '/about', permanent: true },
    ];
  },
};

export default nextConfig;
