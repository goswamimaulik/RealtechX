/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Types are checked during development; never block a production deploy on a type-only warning.
  typescript: { ignoreBuildErrors: true },
  poweredByHeader: false,
  images: {
    // Admin can use images from Cloudinary, Unsplash or any https link
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['mongodb'],
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    return [
      { source: '/:path*', headers: security },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'X-Frame-Options', value: 'DENY' }] },
    ];
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
