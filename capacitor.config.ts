import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Nexalearn.app',
  appName: 'NexaLearn',
  webDir: 'dist',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-2996487725106736~5645483039',
    },
  },
};

export default config;
