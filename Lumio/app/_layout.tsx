import 'react-native-gesture-handler';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider } from '@clerk/clerk-expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppThemeProvider, useAppTheme } from '@/contexts/AppThemeContext';
import { clerkAppearance } from '@/constants/clerk-appearance';
import { tokenCache } from '@/utils/clerk-auth';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

if (!publishableKey) {
  console.warn('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Clerk authentication will not work.');
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function NavigationRoot() {
  const { navigationTheme } = useAppTheme();

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            title: '',
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="journal-write"
          options={{
            headerShown: false,
            title: '',
          }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{
            headerShown: false,
            title: '',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="terms-of-service"
          options={{
            headerShown: false,
            title: '',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={tokenCache}
        appearance={clerkAppearance}
      >
        <AppThemeProvider>
          <NavigationRoot />
        </AppThemeProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
