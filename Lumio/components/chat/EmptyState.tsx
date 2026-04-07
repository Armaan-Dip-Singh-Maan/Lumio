import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export function EmptyState() {
  return (
    <View style={styles.outer}>
      <BlurView intensity={36} tint="dark" style={styles.blur}>
        <View style={styles.cardInner}>
          <Text style={styles.title}>I&apos;m here with you.</Text>
          <Text style={styles.subtitle}>We can take this one thought at a time.</Text>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: HomeSpacing.sm,
  },
  blur: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'hsla(40, 12%, 32%, 0.35)',
    backgroundColor: 'hsla(30, 6%, 14%, 0.55)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 28,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardInner: {
    paddingVertical: HomeSpacing.xl + 4,
    paddingHorizontal: HomeSpacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: HomeTypography.fontSize['2xl'],
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.sm,
    textAlign: 'center',
    lineHeight: HomeTypography.fontSize['2xl'] * 1.25,
  },
  subtitle: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    textAlign: 'center',
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.relaxed,
    opacity: 0.85,
    maxWidth: 300,
  },
});
