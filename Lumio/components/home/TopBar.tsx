import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { getGreeting, getFormattedDate } from '@/utils/get-greeting';

export function TopBar() {
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const date = getFormattedDate();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.logo}>Lumio</Text>
      <Text style={styles.greetingDate}>
        {greeting} • {date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HomeSpacing.md,
    paddingBottom: HomeSpacing.md,
  },
  logo: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 2,
  },
  greetingDate: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.75,
  },
});

