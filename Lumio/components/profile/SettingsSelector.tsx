import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface SettingsSelectorProps<T extends string> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onValueChange: (value: T) => void;
}

export function SettingsSelector<T extends string>({
  label,
  value,
  options,
  onValueChange,
}: SettingsSelectorProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onValueChange(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: HomeSpacing.md,
    paddingHorizontal: HomeSpacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HomeColors.border,
  },
  label: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: HomeSpacing.sm,
  },
  option: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HomeColors.border,
    backgroundColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: HomeColors.primary,
    borderColor: HomeColors.primary,
  },
  optionText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
  },
  optionTextSelected: {
    color: HomeColors.primaryForeground,
    fontWeight: HomeTypography.fontWeight.medium,
  },
});

