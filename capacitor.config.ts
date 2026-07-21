import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.relenazorat.app',
  appName: 'Rele Control',
  webDir: 'dist',
  server: {
    url: 'https://relenazorat.vercel.app',
    cleartext: false
  }
};

export default config;
