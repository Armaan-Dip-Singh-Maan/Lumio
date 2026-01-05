import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  
  // Breathing animation - slow, gentle expansion and contraction
  useEffect(() => {
    // Start breathing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, {
          duration: 3000, // 3 seconds to expand (inhale)
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 3000, // 3 seconds to contract (exhale)
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1, // infinite repeat
      false
    );
    
    // Fade in the circle
    opacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
    
    // Fade in text during exhale phase (after first cycle)
    setTimeout(() => {
      textOpacity.value = withTiming(1, {
        duration: 2000,
        easing: Easing.out(Easing.ease),
      });
    }, 3000); // Start fading in text during the first exhale
    
    // Navigate to main app after showing splash for a bit
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 6000); // Show splash for 6 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  // Animated style for breathing circle
  const circleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  // Animated style for text
  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });
  
  return (
    <LinearGradient
      colors={['#E6F4FE', '#FFFBF5']} // Light blue to warm white
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.content}>
        {/* Breathing Circle */}
        <Animated.View style={[styles.circleContainer, circleStyle]}>
          {/* Outer glow/halo */}
          <View style={styles.outerGlow} />
          {/* Inner solid circle */}
          <View style={styles.innerCircle} />
        </Animated.View>
        
        {/* Lumio Text */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.logoText}>Lumio</Text>
          <Text style={styles.tagline}>REFLECT. BREATHE. GROW.</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  outerGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(173, 216, 230, 0.3)', // Light blue with transparency
    shadowColor: '#ADD8E6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ADD8E6', // Light blue
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '300',
    color: '#4A5568', // Dark grey/blue-grey
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: 'system',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
    color: '#718096', // Muted blue-grey
    letterSpacing: 3,
    fontFamily: 'system',
  },
});

