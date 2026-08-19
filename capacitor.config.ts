import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memory.gallery',
  appName: 'memory-gallery',
  webDir: 'public',
  server: {
    url: 'https://memoryhtt.site',
    cleartext: false
  }
};

export default config;
