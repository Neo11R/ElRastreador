import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.osintrz.rastreador',
  appName: 'El Rastreador',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    AdMob: {
      androidAppId: 'ca-app-pub-8007382165996756~3294139172',
      iosAppId: 'ca-app-pub-3940256099942544~1458002511'
    }
  }
};

export default config;
