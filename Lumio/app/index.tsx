import { useRouter } from 'expo-router';
import React from 'react';
import { SplashScreen } from '@/components/auth/SplashScreen';
import { AuthStorage } from '@/utils/auth-storage';

export default function InitialScreen() {
  const router = useRouter();

  const handleSplashComplete = async () => {
    try {
      const isLoggedIn = await AuthStorage.isLoggedIn();
      
      if (isLoggedIn) {
        // User is already logged in - go directly to home
        router.replace('/(tabs)');
      } else {
        // User is not logged in - go to auth flow
        router.replace('/auth');
      }
    } catch (error) {
      // On error, go to auth flow
      router.replace('/auth');
    }
  };

  return <SplashScreen onComplete={handleSplashComplete} />;
}

