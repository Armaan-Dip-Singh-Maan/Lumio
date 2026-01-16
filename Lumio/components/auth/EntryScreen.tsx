import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LumioLogo } from './LumioLogo';
import { OAuthButton } from './OAuthButton';
import { AuthColors, AuthTypography } from '@/constants/auth-theme';

interface EntryScreenProps {
  onEmailSubmit: (email: string) => void;
  onOAuthPress: (provider: 'apple' | 'google') => void;
  loading?: boolean;
  loadingProvider?: 'apple' | 'google' | null;
}

export function EntryScreen({ onEmailSubmit, onOAuthPress, loading = false, loadingProvider = null }: EntryScreenProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const insets = useSafeAreaInsets();

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(20);

  useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    containerTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError && text) {
      setEmailError('');
    }
  };

  const handleContinue = () => {
    if (!email.trim()) {
      setEmailError('That email looks almost right.');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('That email looks almost right.');
      return;
    }
    onEmailSubmit(email.trim().toLowerCase());
  };

  const isEmailValid = isValidEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <Animated.View style={[styles.content, containerStyle, { paddingTop: insets.top + 40 }]}>
        <LumioLogo delay={200} size="md" />

        <Text style={styles.headline}>Welcome to Lumio</Text>
        <Text style={styles.subtext}>A calm space to reflect and find clarity.</Text>

        <View style={styles.oauthContainer}>
          <OAuthButton
            provider="apple"
            onPress={() => onOAuthPress('apple')}
            loading={loading || loadingProvider === 'apple'}
          />
          <OAuthButton
            provider="google"
            onPress={() => onOAuthPress('google')}
            loading={loading || loadingProvider === 'google'}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with email</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.emailContainer}>
          <TextInput
            style={[styles.emailInput, emailError && styles.emailInputError]}
            placeholder="Email"
            placeholderTextColor={AuthColors.muted}
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            editable={!loading}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!isEmailValid || loading) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isEmailValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={AuthColors.primaryForeground} size="small" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Your thoughts stay private.</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headline: {
    fontSize: AuthTypography.fontSize['2xl'],
    fontWeight: AuthTypography.fontWeight.light,
    color: AuthColors.foreground,
    marginBottom: 8,
    letterSpacing: AuthTypography.letterSpacing,
    textAlign: 'center',
  },
  subtext: {
    fontSize: AuthTypography.fontSize.base,
    fontWeight: AuthTypography.fontWeight.light,
    color: AuthColors.muted,
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 24,
  },
  oauthContainer: {
    width: '100%',
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AuthColors.border,
  },
  dividerText: {
    fontSize: AuthTypography.fontSize.sm,
    color: AuthColors.muted,
    marginHorizontal: 16,
    fontWeight: AuthTypography.fontWeight.regular,
  },
  emailContainer: {
    width: '100%',
    marginBottom: 32,
  },
  emailInput: {
    backgroundColor: AuthColors.card,
    borderWidth: 1,
    borderColor: AuthColors.border,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: AuthTypography.fontSize.base,
    color: AuthColors.foreground,
    marginBottom: 8,
    minHeight: 56,
  },
  emailInputError: {
    borderColor: AuthColors.muted,
  },
  errorText: {
    fontSize: AuthTypography.fontSize.sm,
    color: AuthColors.muted,
    marginBottom: 12,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: AuthColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: AuthTypography.fontSize.base,
    fontWeight: AuthTypography.fontWeight.medium,
    color: AuthColors.primaryForeground,
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: AuthTypography.fontSize.xs,
    color: AuthColors.muted,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
});

