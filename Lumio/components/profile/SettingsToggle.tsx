import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { useThemeColors } from '@/contexts/AppThemeContext';

interface SettingsToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  subtext?: string;
}

export function SettingsToggle({ label, value, onValueChange, subtext }: SettingsToggleProps) {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
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
          color: colors.foreground,
          letterSpacing: HomeTypography.letterSpacing,
          marginBottom: 4,
        },
        subtext: {
          fontSize: HomeTypography.fontSize.sm,
          fontWeight: HomeTypography.fontWeight.light,
          color: colors.muted,
          letterSpacing: HomeTypography.letterSpacing,
          opacity: 0.8,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={
            Platform.OS === 'ios' ? undefined : value ? colors.primaryForeground : colors.muted
          }
          ios_backgroundColor={colors.border}
        />
      </TouchableOpacity>
    </View>
  );
}
