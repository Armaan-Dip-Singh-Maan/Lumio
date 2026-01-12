import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export function EmptyState() {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.title}>I'm here with you.</Text>
          <Text style={styles.subtitle}>We can take this one thought at a time.</Text>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HomeSpacing.xl,
  },
  card: {
    borderRadius: 20,
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    overflow: 'hidden',
  },
  content: {
    padding: HomeSpacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.sm,
    textAlign: 'center',
    opacity: 0.95,
  },
  subtitle: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    textAlign: 'center',
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.relaxed,
    opacity: 0.85,
  },
});

