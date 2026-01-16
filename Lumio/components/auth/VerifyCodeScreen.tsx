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

interface VerifyCodeScreenProps {
  email: string;
  onVerify: (code: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export function VerifyCodeScreen({
  email,
  onVerify,
  onBack,
  loading = false,
}: VerifyCodeScreenProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
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

  const handleCodeChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/[^0-9]/g, '');
    setCode(digitsOnly);
    if (error) {
      setError('');
    }
  };

  const handleVerify = () => {
    if (code.length < 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    onVerify(code);
  };

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
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtext}>
            We sent a verification code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter 6-digit code"
            placeholderTextColor={AuthColors.muted}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            editable={!loading}
            maxLength={6}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.continueButton, (code.length < 6 || loading) && styles.continueButtonDisabled]}
            onPress={handleVerify}
            disabled={code.length < 6 || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={AuthColors.primaryForeground} size="small" />
            ) : (
              <Text style={styles.continueButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
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
  emailText: {
    color: AuthColors.foreground,
    fontWeight: AuthTypography.fontWeight.medium,
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
    fontSize: AuthTypography.fontSize['2xl'],
    color: AuthColors.foreground,
    minHeight: 56,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: AuthTypography.fontWeight.medium,
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
});
