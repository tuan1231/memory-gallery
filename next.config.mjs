/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  serverActions: {
    bodySizeLimit: '10mb',
  },
};

export default nextConfig;
