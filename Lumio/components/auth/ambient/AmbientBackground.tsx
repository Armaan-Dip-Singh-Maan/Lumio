import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export function AmbientBackground() {
  const orb1X = useSharedValue(0);
  const orb1Y = useSharedValue(0);
  const orb2X = useSharedValue(0);
  const orb2Y = useSharedValue(0);
  const orb3X = useSharedValue(0);
  const orb3Y = useSharedValue(0);

  useEffect(() => {
    // Slow, gentle floating animation for orbs
    orb1X.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 15000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-20, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 18000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb2X.value = withRepeat(
      withSequence(
        withTiming(-25, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
        withTiming(25, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 20000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    orb2Y.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 17000, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 17000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 17000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb3X.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 16000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-20, { duration: 16000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 16000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    orb3Y.value = withRepeat(
      withSequence(
        withTiming(-25, { duration: 19000, easing: Easing.inOut(Easing.ease) }),
        withTiming(25, { duration: 19000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 19000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { translateY: orb2Y.value }],
  }));

  const orb3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb3X.value }, { translateY: orb3Y.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.gradientOrb1, orb1Style]}>
        <LinearGradient
          colors={['hsla(163, 20%, 60%, 0.12)', 'hsla(163, 20%, 60%, 0.04)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.gradientOrb2, orb2Style]}>
        <LinearGradient
          colors={['hsla(40, 15%, 50%, 0.1)', 'hsla(40, 15%, 50%, 0.03)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.gradientOrb3, orb3Style]}>
        <LinearGradient
          colors={['hsla(163, 25%, 55%, 0.08)', 'hsla(163, 25%, 55%, 0.02)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'hsl(30, 8%, 8%)',
    overflow: 'hidden',
  },
  gradientOrb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'hsla(163, 20%, 60%, 0.08)',
    top: -100,
    left: -50,
    opacity: 0.6,
  },
  gradientOrb2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'hsla(40, 15%, 50%, 0.06)',
    bottom: -80,
    right: -60,
    opacity: 0.5,
  },
  gradientOrb3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'hsla(163, 25%, 55%, 0.05)',
    top: '40%',
    right: '20%',
    opacity: 0.4,
  },
});

