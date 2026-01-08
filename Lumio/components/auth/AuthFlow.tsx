import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { AmbientBackground } from './ambient/AmbientBackground';
import { EntryScreen } from './EntryScreen';
import { PasswordScreen } from './PasswordScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { SplashScreen } from './SplashScreen';
import { AuthColors, AuthTypography } from '@/constants/auth-theme';
import { AuthStorage } from '@/utils/auth-storage';

type AuthStep = 'splash' | 'entry' | 'password' | 'welcome' | 'complete';
type UserType = 'new' | 'existing' | null;

interface AuthFlowProps {
  onComplete: () => void;
}

// Simulated API functions - replace with actual backend calls
const checkEmailExists = async (email: string): Promise<boolean> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800));
  // For demo: emails ending in @existing.com are existing users
  return email.endsWith('@existing.com');
};

const authenticateOAuth = async (provider: 'apple' | 'google'): Promise<UserType> => {
  // Simulate OAuth flow
  await new Promise((resolve) => setTimeout(resolve, 1200));
  // For demo: randomly return new or existing
  return Math.random() > 0.5 ? 'existing' : 'new';
};

const authenticatePassword = async (
  email: string,
  password: string
): Promise<{ success: boolean }> => {
  // Simulate password authentication
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
};

const createAccount = async (
  email: string,
  password: string
): Promise<{ success: boolean }> => {
  // Simulate account creation
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
};

export function AuthFlow({ onComplete }: AuthFlowProps) {
  const [step, setStep] = useState<AuthStep>('entry');
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSplashForNewUser, setShowSplashForNewUser] = useState(false);

  const handleEmailSubmit = async (submittedEmail: string) => {
    setEmail(submittedEmail);
    setLoading(true);
    setError(null);

    try {
      const exists = await checkEmailExists(submittedEmail);
      setUserType(exists ? 'existing' : 'new');
      setStep('password');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthPress = async (provider: 'apple' | 'google') => {
    setLoading(true);
    setError(null);

    try {
      const type = await authenticateOAuth(provider);
      setUserType(type);

      if (type === 'existing') {
        // Existing user - save auth and go directly to app
        await AuthStorage.saveAuth('oauth_token_' + provider, 'oauth@user.com', false);
        setStep('complete');
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        // New user - save auth and show splash screen first
        await AuthStorage.saveAuth('oauth_token_' + provider, 'oauth@user.com', true);
        setShowSplashForNewUser(true);
        setStep('splash');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (password: string, confirmPassword?: string) => {
    setLoading(true);
    setError(null);

    try {
      if (userType === 'new') {
        const result = await createAccount(email, password);
        if (result.success) {
          // Save auth state for new user
          await AuthStorage.saveAuth('token_' + Date.now(), email, true);
          // Show splash screen for new user
          setShowSplashForNewUser(true);
          setStep('splash');
        } else {
          setError('Account creation failed. Please try again.');
        }
      } else {
        const result = await authenticatePassword(email, password);
        if (result.success) {
          // Save auth state for existing user
          await AuthStorage.saveAuth('token_' + Date.now(), email, false);
          setStep('complete');
          setTimeout(() => {
            onComplete();
          }, 1500);
        } else {
          setError('Incorrect password. Please try again.');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('entry');
    setUserType(null);
    setError(null);
  };

  const handleForgotPassword = () => {
    // For now, just show a message
    // In production, this would trigger password reset flow
    setError('Password reset link sent to your email.');
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  const handleSplashComplete = () => {
    // After splash, show welcome screen for new users
    if (userType === 'new') {
      setStep('welcome');
    } else {
      setStep('complete');
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleWelcomeComplete = () => {
    setStep('complete');
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {step === 'splash' && showSplashForNewUser ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <AmbientBackground />

          {step === 'entry' && (
            <EntryScreen
              onEmailSubmit={handleEmailSubmit}
              onOAuthPress={handleOAuthPress}
              loading={loading}
            />
          )}

          {step === 'password' && userType && (
            <PasswordScreen
              email={email}
              userType={userType}
              onPasswordSubmit={handlePasswordSubmit}
              onBack={handleBack}
              onForgotPassword={handleForgotPassword}
              loading={loading}
            />
          )}

          {step === 'welcome' && (
            <WelcomeScreen onEnter={handleWelcomeComplete} />
          )}

          {step === 'complete' && (
            <View style={styles.completeContainer}>
              <Text style={styles.completeText}>Entering your space…</Text>
              <ActivityIndicator size="large" color={AuthColors.primary} style={{ marginTop: 24 }} />
            </View>
          )}
        </>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completeText: {
    fontSize: AuthTypography.fontSize.lg,
    fontWeight: AuthTypography.fontWeight.light,
    color: AuthColors.foreground,
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: AuthColors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  errorText: {
    fontSize: AuthTypography.fontSize.sm,
    color: AuthColors.muted,
    textAlign: 'center',
  },
});

