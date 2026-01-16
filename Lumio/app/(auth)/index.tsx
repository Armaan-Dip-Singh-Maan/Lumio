import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { AuthFlow } from '@/components/auth/AuthFlow';

export default function AuthScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Additional guard: if somehow user is signed in, redirect immediately
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleAuthComplete = () => {
    // Navigate to main app after authentication
    router.replace('/(tabs)');
  };

  // Don't render auth flow if already signed in (guard will redirect)
  if (isLoaded && isSignedIn) {
    return null;
  }

  return <AuthFlow onComplete={handleAuthComplete} />;
}
