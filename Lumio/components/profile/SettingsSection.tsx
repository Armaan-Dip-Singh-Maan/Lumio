import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { useThemeColors } from '@/contexts/AppThemeContext';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: HomeSpacing.xl,
        },
        title: {
          fontSize: HomeTypography.fontSize.sm,
          fontWeight: HomeTypography.fontWeight.medium,
          color: colors.muted,
          letterSpacing: HomeTypography.letterSpacing,
          textTransform: 'uppercase',
          marginBottom: HomeSpacing.sm,
          paddingHorizontal: HomeSpacing.md,
          opacity: 0.7,
        },
      }),
    [colors.muted]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}
