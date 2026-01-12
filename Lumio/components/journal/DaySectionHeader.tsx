import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { formatDayHeader } from '@/utils/journal-helpers';

interface DaySectionHeaderProps {
  date: string; // YYYY-MM-DD
}

export function DaySectionHeader({ date }: DaySectionHeaderProps) {
  const headerText = formatDayHeader(date);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{headerText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.md,
    paddingTop: HomeSpacing.lg,
  },
  text: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

