import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { getGreeting, getFormattedDate } from '@/utils/get-greeting';

interface TopBarProps {
  onProfilePress?: () => void;
}

export function TopBar({ onProfilePress }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const date = getFormattedDate();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftSection}>
        <Text style={styles.logo}>Lumio</Text>
        <Text style={styles.greetingDate}>
          {greeting} • {date}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onProfilePress}
        style={styles.profileButton}
        activeOpacity={0.7}
      >
        <IconSymbol
          name={'person.fill' as 'person.fill'}
          size={20}
          color={HomeColors.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HomeSpacing.md,
    paddingBottom: HomeSpacing.md,
  },
  leftSection: {
    flex: 1,
  },
  logo: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 2,
  },
  greetingDate: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.75,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
});

