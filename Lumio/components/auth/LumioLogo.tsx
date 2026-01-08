import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { AuthColors } from '@/constants/auth-theme';

interface LumioLogoProps {
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LumioLogo({ delay = 0, size = 'md' }: LumioLogoProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const sizeStyles = {
    sm: { width: 60, height: 60, fontSize: 32 },
    md: { width: 80, height: 80, fontSize: 42 },
    lg: { width: 100, height: 100, fontSize: 52 },
  }[size];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.circle, { width: sizeStyles.width, height: sizeStyles.height }]}>
        <View style={styles.innerCircle} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  circle: {
    borderRadius: 50,
    backgroundColor: 'hsla(163, 20%, 60%, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'hsl(163, 20%, 60%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  innerCircle: {
    width: '60%',
    height: '60%',
    borderRadius: 50,
    backgroundColor: 'hsl(163, 20%, 60%)',
  },
});

