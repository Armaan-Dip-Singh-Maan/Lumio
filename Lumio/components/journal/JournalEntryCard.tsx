import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { JournalEntry } from '@/utils/journal-storage';
import { formatTime, getPreviewSnippet } from '@/utils/journal-helpers';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
}

export function JournalEntryCard({ entry, onPress }: JournalEntryCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
    opacity.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const timeString = formatTime(entry.createdAt);
  const preview = getPreviewSnippet(entry.content);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={() => onPress(entry)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.content}>
            <Text style={styles.time}>{timeString}</Text>
            <Text style={styles.preview} numberOfLines={3}>
              {preview}
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    marginBottom: HomeSpacing.sm,
    overflow: 'hidden',
  },
  content: {
    padding: HomeSpacing.md,
  },
  time: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.75,
    marginBottom: HomeSpacing.xs / 2,
  },
  preview: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.relaxed,
    opacity: 0.9,
  },
});

