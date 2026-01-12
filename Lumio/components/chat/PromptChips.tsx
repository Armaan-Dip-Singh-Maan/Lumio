import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface PromptChipsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  'I feel overwhelmed',
  'I need clarity',
  'Help me reflect',
];

export function PromptChips({ onSelect }: PromptChipsProps) {
  return (
    <View style={styles.container}>
      {PROMPTS.map((prompt, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onSelect(prompt)}
          style={styles.chip}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{prompt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: HomeSpacing.sm,
    paddingHorizontal: HomeSpacing.md,
    marginTop: HomeSpacing.lg,
  },
  chip: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm,
    borderRadius: 20,
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
  },
  chipText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.9,
  },
});

