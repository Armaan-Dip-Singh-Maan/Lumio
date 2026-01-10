import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface PrimaryJournalCardProps {
  hasEntryToday?: boolean;
  onWritePress: () => void;
}

export function PrimaryJournalCard({ hasEntryToday = false, onWritePress }: PrimaryJournalCardProps) {
  const cardScale = useSharedValue(1);
  const cardTranslateY = useSharedValue(6);
  const cardOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const orbOpacity = useSharedValue(0.12);
  const orbScale = useSharedValue(1);

  // Fade-up animation on load
  useEffect(() => {
    cardOpacity.value = withDelay(50, withTiming(1, { duration: 600 }));
    cardTranslateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subtle breathing orb animation (very slow)
  useEffect(() => {
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardPressIn = () => {
    cardScale.value = withSpring(0.99, { damping: 20, stiffness: 400 });
  };

  const handleCardPressOut = () => {
    cardScale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    buttonOpacity.value = withTiming(0.9, { duration: 100 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    buttonOpacity.value = withTiming(1, { duration: 100 });
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }, { translateY: cardTranslateY.value }],
    opacity: cardOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const orbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbOpacity.value,
  }));

  const title = 'Take a breath.';
  const prompt = hasEntryToday
    ? "Would you like to add another thought?"
    : "What's on your mind right now?";
  const supportiveLine = "One sentence is enough.";
  const ctaText = hasEntryToday ? 'Write more' : 'Write';
  const lastEntryText = hasEntryToday ? 'Last entry: earlier today' : null;

  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      {/* Subtle gradient orb for depth */}
      <Animated.View style={[styles.orbContainer, orbAnimatedStyle]} pointerEvents="none">
        <LinearGradient
          colors={[
            'hsla(163, 25%, 55%, 0.08)',
            'hsla(163, 25%, 55%, 0.03)',
            'transparent',
          ]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.orb}
        />
      </Animated.View>

      <BlurView intensity={24} tint="dark" style={styles.blurView}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.prompt}>{prompt}</Text>
          <Text style={styles.supportiveLine}>{supportiveLine}</Text>

          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={onWritePress}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              style={styles.writeButton}
              activeOpacity={1}
            >
              <Text style={styles.writeButtonText}>{ctaText}</Text>
            </TouchableOpacity>
          </Animated.View>

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
  orbContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
    borderRadius: 100,
    overflow: 'hidden',
    zIndex: 0,
  },
  orb: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: HomeSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    position: 'relative',
    zIndex: 1,
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
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    textAlign: 'center',
    marginBottom: HomeSpacing.sm,
    lineHeight: HomeTypography.fontSize.lg * HomeTypography.lineHeight.relaxed,
    opacity: 0.92,
  },
  supportiveLine: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    textAlign: 'center',
    marginBottom: HomeSpacing.xl,
    opacity: 0.75,
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
    shadowColor: HomeColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
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

