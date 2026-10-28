import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jenarishikesh.forapp',
  appName: 'FOR',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_for',
      iconColor: '#ed1c24',
    },
  },
};

export default config;
