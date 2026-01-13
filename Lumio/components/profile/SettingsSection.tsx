import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: HomeSpacing.xl,
  },
  title: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    textTransform: 'uppercase',
    marginBottom: HomeSpacing.sm,
    paddingHorizontal: HomeSpacing.md,
    opacity: 0.7,
  },
});

