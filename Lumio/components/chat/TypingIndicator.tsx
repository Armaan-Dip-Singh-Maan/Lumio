import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export function TypingIndicator() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Novi is here…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: HomeSpacing.md,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});

