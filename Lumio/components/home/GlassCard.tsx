import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { HomeColors, HomeSpacing } from '@/constants/home-theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animated?: boolean;
  delay?: number;
}

export function GlassCard({ children, style, animated = true, delay = 0 }: GlassCardProps) {
  const translateY = useSharedValue(6);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        opacity.value = withTiming(1, { duration: 600 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      }, delay);

      return () => clearTimeout(timer);
    } else {
      opacity.value = 1;
      translateY.value = 0;
    }
  }, [animated, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle, style]}>
      <BlurView intensity={24} tint="dark" style={styles.blurView}>
        {children}
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: HomeColors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  blurView: {
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
  },
});

