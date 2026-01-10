import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AuthColors } from '@/constants/auth-theme';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

export function AmbientBackground() {
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    // Initialize stars - very subtle, slow-moving shower
    const starCount = 25; // Fewer stars for calmness
    starsRef.current = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: 0, // All start from top
      size: 1.5 + Math.random() * 1.5, // Very small stars (1.5-3px)
      opacity: 0.2 + Math.random() * 0.15, // Very subtle (0.2-0.35)
      speed: 0.4 + Math.random() * 0.3, // Very slow speed (0.4-0.7)
    }));
  }, []);

  // Render stars using animated views
  return (
    <View style={styles.container} pointerEvents="none">
      {starsRef.current.map((star) => (
        <StarParticle key={star.id} star={star} />
      ))}
    </View>
  );
}

function StarParticle({
  star,
}: {
  star: Star;
}) {
  const translateY = useSharedValue(-50); // Start above screen

  useEffect(() => {
    // Each star falls at its own very slow pace
    const duration = 25000 + star.speed * 15000; // 25-40 seconds - very slow
    translateY.value = withRepeat(
      withTiming(height + 100, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: star.opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: 0,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AuthColors.background,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    backgroundColor: 'hsl(40, 20%, 92%)', // Very subtle white/light color
  },
});
