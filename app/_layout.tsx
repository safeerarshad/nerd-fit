import { Suspense } from 'react';
import { Text } from 'react-native';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrate } from '../src/data/sqlite/migrations';
import { adaptExpo } from '../src/data/sqlite/expoAdapter';
import { Screen } from '../src/components/Screen';
import { Button } from '../src/components/Button';
import { colors } from '../src/design/tokens';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <SafeAreaProvider><Screen title="Your data needs a moment">
    <Text style={{ color: colors.secondary }}>Nerd Fit could not open your local data. Your records have not been reset.</Text>
    <Button label="Try again" onPress={retry} />
  </Screen></SafeAreaProvider>;
}

export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider>
    <StatusBar style="light" />
    <Suspense fallback={<Screen title="Nerd Fit"><Text style={{ color: colors.secondary }}>Opening your journal…</Text></Screen>}>
      <SQLiteProvider databaseName="nerdfit.db" onInit={(db) => migrate(adaptExpo(db))} useSuspense>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </SQLiteProvider>
    </Suspense>
  </SafeAreaProvider></GestureHandlerRootView>;
}
