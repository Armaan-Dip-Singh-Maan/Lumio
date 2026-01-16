import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSignIn, useSignUp, useOAuth, useAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { AmbientBackground } from './ambient/AmbientBackground';
import { EntryScreen } from './EntryScreen';
import { PasswordScreen } from './PasswordScreen';
import { VerifyCodeScreen } from './VerifyCodeScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { SplashScreen } from './SplashScreen';
import { AuthColors, AuthTypography } from '@/constants/auth-theme';
import { checkEmailExists } from '@/utils/clerk-auth';

type AuthStep = 'entry' | 'password' | 'verify' | 'welcome' | 'complete';
type UserType = 'new' | 'existing' | null;

interface AuthFlowProps {
  onComplete: () => void;
}

export function AuthFlow({ onComplete }: AuthFlowProps) {
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });
  const { isSignedIn } = useAuth();

  const [step, setStep] = useState<AuthStep>('entry');
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSplashForNewUser, setShowSplashForNewUser] = useState(false);

  // Check if user is already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      onComplete();
    }
  }, [isSignedIn, onComplete]);

  const handleEmailSubmit = async (submittedEmail: string) => {
    setEmail(submittedEmail);
    setLoading(true);
    setError(null);

    try {
      // Use Clerk to check if email exists
      // Pass the signIn object so we can create a sign-in attempt to check
      if (!signIn) {
        // If signIn is not ready, default to new user (sign-up flow)
        setUserType('new');
        setStep('password');
        setLoading(false);
        return;
      }

      const exists = await checkEmailExists(submittedEmail, signIn);
      setUserType(exists ? 'existing' : 'new');
      setStep('password');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthPress = async (provider: 'apple' | 'google') => {
    setLoadingProvider(provider);
    setError(null);

    try {
      const startOAuth = provider === 'apple' ? startAppleOAuth : startGoogleOAuth;
      const redirectUrl = Linking.createURL('/(auth)', {});
      
      const { createdSessionId, setActive } = await startOAuth({
        redirectUrl,
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        // Check if this is a new user by checking if they just signed up
        // For OAuth, we'll treat it as existing user for simplicity
        // In production, you might want to check user metadata
        onComplete();
      } else {
        setError('Authentication incomplete. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handlePasswordSubmit = async (password: string, confirmPassword?: string) => {
    if (!signIn || !signUp) {
      setError('Authentication service not ready. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (userType === 'new') {
        // Sign up flow
        if (password !== confirmPassword) {
          setError("Passwords don't match.");
          setLoading(false);
          return;
        }

        const result = await signUp.create({
          emailAddress: email,
          password,
        });

        // Check if email verification is required
        if (result.status === 'missing_requirements') {
          if (result.unverifiedFields?.includes('email_address')) {
            // Send verification email
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setStep('verify');
            setLoading(false);
            return;
          }
        }

        if (result.status === 'complete' && result.createdSessionId) {
          await setActiveSignUp({ session: result.createdSessionId });
          setShowSplashForNewUser(true);
          setStep('welcome');
        } else {
          setError('Account creation incomplete. Please try again.');
        }
      } else {
        // Sign in flow
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === 'complete' && result.createdSessionId) {
          await setActiveSignIn({ session: result.createdSessionId });
          onComplete();
        } else {
          setError('Sign in incomplete. Please try again.');
        }
      }
    } catch (err: any) {
      // Handle Clerk errors gracefully
      const errorMessage =
        err?.errors?.[0]?.message ||
        err?.message ||
        (userType === 'new'
          ? 'Something went wrong. Please try again.'
          : "That password doesn't seem right.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!signUp) {
      setError('Verification service not ready. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActiveSignUp({ session: result.createdSessionId });
        setShowSplashForNewUser(true);
        setStep('welcome');
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      const errorMessage =
        err?.errors?.[0]?.message ||
        err?.message ||
        "That code doesn't seem right.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('entry');
    setUserType(null);
    setError(null);
    setEmail('');
  };

  const handleForgotPassword = async () => {
    if (!signIn) {
      setError('Password reset service not ready. Please try again.');
      return;
    }

    try {
      // Create a password reset attempt
      await signIn.create({
        identifier: email,
      });
      // Then prepare password reset
      await signIn.prepareFirstFactor({
        strategy: 'reset_password_email_code',
      });
      setError('Password reset link sent to your email.');
      setTimeout(() => {
        setError(null);
      }, 3000);
    } catch (err: any) {
      setError('Could not send reset email. Please try again.');
    }
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
    onComplete();
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
              loading={loading || !!loadingProvider}
              loadingProvider={loadingProvider}
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

          {step === 'verify' && (
            <VerifyCodeScreen
              email={email}
              onVerify={handleVerifyCode}
              onBack={() => {
                setStep('password');
                setError(null);
              }}
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
  },
  completeText: {
    fontSize: AuthTypography.fontSize.lg,
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

