import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memory.gallery',
  appName: 'memory-gallery',
  webDir: 'public',
  server: {
    url: 'http://10.0.2.2:3000', // Change this to your Netlify URL for production
    cleartext: true
  }
};

export default config;
