import { Tabs } from 'expo-router';
import React from 'react';

import { CustomTabBar } from '@/components/custom-tab-bar';

export default function TabLayout() {
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
