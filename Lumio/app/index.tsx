import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { SplashScreen } from '@/components/auth/SplashScreen';

export default function InitialScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const handleSplashComplete = () => {
    // Wait for Clerk to finish loading
    if (!isLoaded) {
      // If not loaded yet, wait a bit and check again
      setTimeout(handleSplashComplete, 100);
      return;
    }

    if (isSignedIn) {
      // User is already signed in - go directly to home
      router.replace('/(tabs)');
    } else {
      // User is not signed in - go to auth flow
      router.replace('/(auth)');
    }
  };

  // Check auth state when Clerk loads and redirect accordingly
  // This prevents redirect loops by ensuring we only redirect once when loaded
  useEffect(() => {
    if (isLoaded) {
      // Small delay to ensure navigation is ready
      const timer = setTimeout(() => {
        if (isSignedIn) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, router]);

  return <SplashScreen onComplete={handleSplashComplete} />;
}

