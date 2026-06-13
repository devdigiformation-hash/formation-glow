import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.earnwithdg.app',
  appName: 'Earn with DG',
  webDir: 'dist/client',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
  },
  server: {
    // Load the LIVE site inside the APK so all server functions
    // (AI assistant, Rebrand, login, etc.) hit the real backend
    // instead of localhost inside the phone.
    url: 'https://formation-glow.lovable.app',
    androidScheme: 'https',
    allowNavigation: ['*.lovable.app', 'formation-glow.lovable.app'],
  },
};

export default config;
