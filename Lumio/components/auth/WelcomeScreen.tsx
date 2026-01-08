import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LumioLogo } from './LumioLogo';
import { AuthColors, AuthTypography } from '@/constants/auth-theme';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(20);

  useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    containerTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    // Auto-navigate after 2000ms delay (removed button)
    const timer = setTimeout(() => {
      onEnter();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));


  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, containerStyle]}>
        <LumioLogo delay={0} size="lg" />

        <Text style={styles.title}>You're all set 🌿</Text>
        <Text style={styles.text}>
          Take a moment.{'\n'}Lumio is here when you're ready.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: AuthTypography.fontSize['3xl'],
    fontWeight: AuthTypography.fontWeight.light,
    color: AuthColors.foreground,
    marginTop: 32,
    marginBottom: 16,
    letterSpacing: AuthTypography.letterSpacing,
    textAlign: 'center',
  },
  text: {
    fontSize: AuthTypography.fontSize.lg,
    fontWeight: AuthTypography.fontWeight.light,
    color: AuthColors.muted,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 48,
  },
});

