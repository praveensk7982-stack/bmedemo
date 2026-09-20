import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Hospivio.app',
  appName: 'Hospivio',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;
