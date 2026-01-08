import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform, View, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
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
      bgColor: '#FFFFFF',
      textColor: '#000000',
      borderColor: '#E5E5E5',
    },
    google: {
      label: 'Continue with Google',
      bgColor: '#FFFFFF',
      textColor: '#000000',
      borderColor: '#E5E5E5',
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
            borderColor: providerConfig.borderColor,
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
            {provider === 'apple' ? (
              <View style={styles.appleIconContainer}>
                <Image
                  source={require('../../assets/images/Apple_logo.png')}
                  style={styles.appleLogo}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.googleIconContainer}>
                <Image
                  source={require('../../assets/images/Google_logo.png')}
                  style={styles.googleLogo}
                  resizeMode="contain"
                />
              </View>
            )}
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
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appleIconContainer: {
    marginRight: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleLogo: {
    width: 20,
    height: 20,
  },
  googleIconContainer: {
    marginRight: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#000000',
  },
});

