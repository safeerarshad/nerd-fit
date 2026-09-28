import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Nerd Fit',
  slug: 'nerd-fit',
  version: '0.1.0',
  scheme: 'nerdfit',
  userInterfaceStyle: 'dark',
  orientation: 'default',
  android: {
    package: 'dev.safeerarshad.nerdfit',
    versionCode: 1,
    allowBackup: false,
    blockedPermissions: ['android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'],
    predictiveBackGestureEnabled: true,
  },
  plugins: ['expo-router', ['expo-sqlite', { enableFTS: true }], '@react-native-community/datetimepicker', './plugins/withLocalAndroid.cjs'],
};
export default config;
