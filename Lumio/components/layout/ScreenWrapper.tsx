import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '@/constants/navigation';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * Reusable screen wrapper that applies safe area insets and tab bar padding
 * Use this for tab screens to ensure content doesn't overlap with the tab bar
 */
export function ScreenWrapper({
  children,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'],
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={edges} style={[styles.container, style]}>
      <View
        style={[
          styles.content,
          {
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

