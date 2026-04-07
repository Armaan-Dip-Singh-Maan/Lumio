import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 480, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: 480, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function TypingIndicator() {
  return (
    <View style={styles.wrap}>
      <BlurView intensity={18} tint="dark" style={styles.blur}>
        <Text style={styles.label}>Taking a quiet moment</Text>
        <View style={styles.dotsRow}>
          <Dot delay={0} />
          <Dot delay={180} />
          <Dot delay={360} />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'flex-start',
  },
  blur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm + 2,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    backgroundColor: 'hsla(30, 6%, 18%, 0.55)',
  },
  label: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: HomeColors.primary,
  },
});
