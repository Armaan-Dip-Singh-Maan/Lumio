import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
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
  const [showButton, setShowButton] = useState(false);
  const insets = useSafeAreaInsets();

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(10);

  useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    containerTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    // Show button after 1200ms delay
    setTimeout(() => {
      setShowButton(true);
      buttonOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
      buttonTranslateY.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
    }, 1200);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, containerStyle]}>
        <LumioLogo delay={0} size="lg" />

        <Text style={styles.title}>You're all set 🌿</Text>
        <Text style={styles.text}>
          Take a moment.{'\n'}Lumio is here when you're ready.
        </Text>

        {showButton && (
          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              style={styles.enterButton}
              onPress={onEnter}
              activeOpacity={0.8}
            >
              <Text style={styles.enterButtonText}>Enter Lumio</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
  enterButton: {
    backgroundColor: AuthColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 200,
  },
  enterButtonText: {
    fontSize: AuthTypography.fontSize.base,
    fontWeight: AuthTypography.fontWeight.medium,
    color: AuthColors.primaryForeground,
    letterSpacing: 0.3,
  },
});

