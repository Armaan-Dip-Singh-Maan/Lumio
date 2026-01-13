import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface SettingsToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  subtext?: string;
}

export function SettingsToggle({ label, value, onValueChange, subtext }: SettingsToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {subtext && <Text style={styles.subtext}>{subtext}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: HomeColors.border, true: HomeColors.primary }}
          thumbColor={Platform.OS === 'ios' ? undefined : value ? HomeColors.primaryForeground : HomeColors.muted}
          ios_backgroundColor={HomeColors.border}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HomeColors.border,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HomeSpacing.md,
    paddingHorizontal: HomeSpacing.md,
    minHeight: 60,
  },
  textContainer: {
    flex: 1,
    marginRight: HomeSpacing.md,
  },
  label: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 4,
  },
  subtext: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.8,
  },
});

