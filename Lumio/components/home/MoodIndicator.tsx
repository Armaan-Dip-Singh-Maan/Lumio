import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface MoodIndicatorProps {
  mood: string;
  emoji: string;
  onPress?: () => void;
}

export function MoodIndicator({ mood, emoji, onPress }: MoodIndicatorProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={styles.text}>
        Mood today: {emoji} {mood}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm,
    marginBottom: HomeSpacing.lg,
  },
  text: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
  },
});

