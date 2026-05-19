/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  transpilePackages: ["tw-animate-css"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.trycloudflare.com", "localhost:3000", "192.168.1.9", "owner-floors-prototype-rapid.trycloudflare.com"]
    }
  },
  // Allow Cloudflare Tunnel dev support
  allowedDevOrigins: ["*.trycloudflare.com", "localhost:3000", "192.168.1.9", "owner-floors-prototype-rapid.trycloudflare.com"],
  // Allow Cloudflare Tunnel hostname
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|png|jpg|webp|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
