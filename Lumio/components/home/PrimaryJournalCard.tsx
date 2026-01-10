import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface PrimaryJournalCardProps {
  hasEntryToday?: boolean;
  onWritePress: () => void;
}

export function PrimaryJournalCard({ hasEntryToday = false, onWritePress }: PrimaryJournalCardProps) {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    elevation.value = withTiming(-1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    elevation.value = withTiming(0, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: elevation.value }],
  }));

  const title = 'Take a breath.';
  const prompt = hasEntryToday
    ? "Would you like to add another thought?"
    : "What's on your mind right now?";
  const ctaText = hasEntryToday ? 'Write more' : 'Write';
  const lastEntryText = hasEntryToday ? 'Last entry: earlier today' : null;

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <BlurView intensity={24} tint="dark" style={styles.blurView}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.prompt}>{prompt}</Text>

          <TouchableOpacity
            onPress={onWritePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.writeButton}
            activeOpacity={0.9}
          >
            <Text style={styles.writeButtonText}>{ctaText}</Text>
          </TouchableOpacity>

          {lastEntryText && (
            <Text style={styles.lastEntryText}>{lastEntryText}</Text>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: HomeSpacing.md,
    marginTop: HomeSpacing.lg,
    marginBottom: HomeSpacing.xl,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: HomeColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  blurView: {
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
  },
  content: {
    padding: HomeSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
  },
  title: {
    fontSize: HomeTypography.fontSize['2xl'],
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.md,
    textAlign: 'center',
  },
  prompt: {
    fontSize: HomeTypography.fontSize.lg,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    textAlign: 'center',
    marginBottom: HomeSpacing.xl,
    lineHeight: HomeTypography.fontSize.lg * HomeTypography.lineHeight.relaxed,
  },
  writeButton: {
    backgroundColor: HomeColors.primary,
    paddingVertical: HomeSpacing.md + 4,
    paddingHorizontal: HomeSpacing.xl + 8,
    borderRadius: 16,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  writeButtonText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.primaryForeground,
    letterSpacing: 0.3,
  },
  lastEntryText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    marginTop: HomeSpacing.md,
    opacity: 0.7,
  },
});

