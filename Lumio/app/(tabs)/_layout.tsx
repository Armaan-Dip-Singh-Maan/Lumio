import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

import { CustomTabBar } from '@/components/custom-tab-bar';

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Navigation guard: protect tabs routes
  useEffect(() => {
    if (!isLoaded) {
      // Wait for Clerk to finish loading
      return;
    }

    // If user is not signed in and trying to access protected routes, redirect to auth
    if (!isSignedIn) {
      router.replace('/(auth)');
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade', // Smooth fade transition
        animationDuration: 200, // Quick but smooth
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarButton: () => null, // Handled by custom tab bar
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarButton: () => null, // Handled by custom tab bar
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarButton: () => null, // Handled by custom tab bar
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarButton: () => null, // Handled by custom tab bar
        }}
      />
    </Tabs>
  );
}
