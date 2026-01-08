import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthStorage } from '@/utils/auth-storage';
import { AuthColors } from '@/constants/auth-theme';

export default function InitialScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
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
      } finally {
        setIsChecking(false);
      }
    };

    // Small delay for smooth transition
    const timer = setTimeout(() => {
      checkAuth();
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={styles.container}>
      {isChecking && (
        <ActivityIndicator size="large" color={AuthColors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AuthColors.background,
  },
});

