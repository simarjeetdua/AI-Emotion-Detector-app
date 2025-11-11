/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent @vladmandic/face-api from being imported on the server
      config.externals = config.externals || [];
      config.externals.push({
        '@vladmandic/face-api': 'commonjs @vladmandic/face-api',
      });
    }
    return config;
  },

  // Optional: can silence Turbopack warning safely
  turbopack: {},
};

module.exports = nextConfig;
