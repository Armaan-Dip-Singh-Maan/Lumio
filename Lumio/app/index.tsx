import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { SplashScreen } from '@/components/auth/SplashScreen';
import { BiometricUnlockScreen } from '@/components/auth/BiometricUnlockScreen';
import { useAppTheme } from '@/contexts/AppThemeContext';

export default function InitialScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const { isReady, biometricsEnabled } = useAppTheme();

  const [pendingSplash, setPendingSplash] = useState(true);
  const [needBio, setNeedBio] = useState(false);

  const handleSplashComplete = () => {
    setPendingSplash(false);
  };

  useEffect(() => {
    if (pendingSplash) return;
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/(auth)');
      return;
    }
    if (!isReady) return;
    if (biometricsEnabled) {
      setNeedBio(true);
      return;
    }
    router.replace('/(tabs)');
  }, [pendingSplash, isLoaded, isSignedIn, isReady, biometricsEnabled, router]);

  const handleBiometricUnlocked = useCallback(() => {
    setNeedBio(false);
    router.replace('/(tabs)');
  }, [router]);

  const handleBiometricSignOut = useCallback(async () => {
    try {
      await signOut();
      setNeedBio(false);
      router.replace('/(auth)');
    } catch (e) {
      console.error(e);
    }
  }, [router, signOut]);

  if (needBio && isSignedIn && isReady) {
    return (
      <BiometricUnlockScreen onUnlocked={handleBiometricUnlocked} onSignOut={handleBiometricSignOut} />
    );
  }

  return <SplashScreen onComplete={handleSplashComplete} />;
}
