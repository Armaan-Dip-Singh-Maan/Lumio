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
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AuthColors, AuthTypography } from '@/constants/auth-theme';

interface PasswordScreenProps {
  email: string;
  userType: 'new' | 'existing';
  onPasswordSubmit: (password: string, confirmPassword?: string) => void;
  onBack: () => void;
  onForgotPassword: () => void;
  loading?: boolean;
}

export function PasswordScreen({
  email,
  userType,
  onPasswordSubmit,
  onBack,
  onForgotPassword,
  loading = false,
}: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
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

  const isNewUser = userType === 'new';

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  const handleContinue = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (isNewUser) {
      if (password !== confirmPassword) {
        setConfirmPasswordError("That doesn't seem to match yet.");
        return;
      }
      onPasswordSubmit(password, confirmPassword);
    } else {
      onPasswordSubmit(password);
    }
  };

  const isFormValid = isNewUser
    ? password.length >= 6 && password === confirmPassword
    : password.length >= 6;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={[styles.content, containerStyle, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton} disabled={loading}>
          <IconSymbol
            name={'chevron.left' as 'chevron.left'}
            size={20}
            color={AuthColors.foreground}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>
            {isNewUser ? 'Welcome to Lumio' : 'Welcome back'}
          </Text>
          <Text style={styles.subtext}>
            {isNewUser
              ? "Let's set up your private space."
              : 'Enter your password to continue.'}
          </Text>
        </View>

        <View style={styles.emailDisplay}>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
            placeholder={isNewUser ? 'Create a password' : 'Your password'}
            placeholderTextColor={AuthColors.muted}
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            editable={!loading}
            autoComplete={isNewUser ? 'new-password' : 'current-password'}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {isNewUser && (
            <>
              <TextInput
                style={[styles.input, confirmPasswordError && styles.inputError, { marginTop: 16 }]}
                placeholder="Confirm password"
                placeholderTextColor={AuthColors.muted}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                autoComplete="new-password"
              />
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </>
          )}

          <TouchableOpacity
            style={[styles.continueButton, (!isFormValid || loading) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={AuthColors.primaryForeground} size="small" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {!isNewUser && (
            <TouchableOpacity
              onPress={onForgotPassword}
              style={styles.forgotPasswordButton}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          )}
        </View>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: AuthTypography.fontSize.base,
    color: AuthColors.foreground,
    marginLeft: 8,
    fontWeight: AuthTypography.fontWeight.regular,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: AuthTypography.fontSize['2xl'],
    fontWeight: AuthTypography.fontWeight.light,
    color: AuthColors.foreground,
    marginBottom: 8,
    letterSpacing: AuthTypography.letterSpacing,
  },
  subtext: {
    fontSize: AuthTypography.fontSize.base,
    fontWeight: AuthTypography.fontWeight.light,
    color: AuthColors.muted,
    lineHeight: 24,
  },
  emailDisplay: {
    backgroundColor: AuthColors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  emailText: {
    fontSize: AuthTypography.fontSize.base,
    color: AuthColors.muted,
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: AuthColors.card,
    borderWidth: 1,
    borderColor: AuthColors.border,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: AuthTypography.fontSize.base,
    color: AuthColors.foreground,
    minHeight: 56,
  },
  inputError: {
    borderColor: AuthColors.muted,
  },
  errorText: {
    fontSize: AuthTypography.fontSize.sm,
    color: AuthColors.muted,
    marginTop: 8,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: AuthColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 24,
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
  forgotPasswordButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: AuthTypography.fontSize.sm,
    color: AuthColors.muted,
    fontWeight: AuthTypography.fontWeight.regular,
  },
});

