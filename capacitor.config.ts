import type { CapacitorConfig } from '@capacitor/cli';

const remoteUrl =
    process.env.CAPACITOR_REMOTE_URL ||
    'https://project--decc67c2-b397-453a-98ef-1296404f6cba-dev.lovable.app';

const config: CapacitorConfig = {
    appId: 'com.earnwithdg.app',
    appName: 'Earn with DG',
    webDir: 'dist/client',
    bundledWebRuntime: false,
    android: {
          allowMixedContent: false,
    },
    server: {
          url: remoteUrl,
          cleartext: false,
          androidScheme: 'https',
          allowNavigation: ['*.lovable.app'],
    },
};

export default config;
