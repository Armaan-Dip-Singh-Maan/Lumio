import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Navigation guard: if user is already signed in, redirect to tabs
  useEffect(() => {
    if (!isLoaded) {
      // Wait for Clerk to finish loading
      return;
    }

    // If user is already signed in, redirect to main app
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        title: '', // Explicitly set empty title
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: '', // Ensure no title shows
        }}
      />
    </Stack>
  );
}
