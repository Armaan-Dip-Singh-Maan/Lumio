import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface PromptChipsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  'I feel overwhelmed',
  'I need clarity',
  'Help me reflect',
  'Something good happened today',
  'I want to let something go',
  'Name one small win',
];

export function PromptChips({ onSelect }: PromptChipsProps) {
  return (
    <View style={styles.container}>
      {PROMPTS.map((prompt, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onSelect(prompt)}
          style={styles.chip}
          activeOpacity={0.75}
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
    alignItems: 'center',
    gap: 10,
    paddingBottom: 20
  },
  chip: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm,
    borderRadius: 20,
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  chipText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.92,
  },
});
