import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { AuthColors } from '@/constants/auth-theme';

interface OAuthButtonProps {
  provider: 'apple' | 'google';
  onPress: () => void;
  loading?: boolean;
}

export function OAuthButton({ provider, onPress, loading = false }: OAuthButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const providerConfig = {
    apple: {
      label: 'Continue with Apple',
      icon: '🍎',
      bgColor: '#000000',
      textColor: '#FFFFFF',
    },
    google: {
      label: 'Continue with Google',
      icon: 'G',
      bgColor: '#FFFFFF',
      textColor: '#1F1F1F',
    },
  }[provider];

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        activeOpacity={0.9}
        style={[
          styles.button,
          {
            backgroundColor: providerConfig.bgColor,
            opacity: loading ? 0.6 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={providerConfig.textColor}
            size="small"
          />
        ) : (
          <>
            <Text style={[styles.icon, { color: providerConfig.textColor }]}>
              {providerConfig.icon}
            </Text>
            <Text style={[styles.label, { color: providerConfig.textColor }]}>
              {providerConfig.label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

