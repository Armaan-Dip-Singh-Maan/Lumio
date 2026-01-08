import React from 'react';
import { AuthFlow } from '@/components/auth/AuthFlow';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const router = useRouter();

  const handleAuthComplete = () => {
    // Navigate to main app after authentication
    router.replace('/(tabs)');
  };

  return <AuthFlow onComplete={handleAuthComplete} />;
}

