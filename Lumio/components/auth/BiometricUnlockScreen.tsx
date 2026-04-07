import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { HomeColorsDark, HomeTypography, HomeSpacing } from '@/constants/home-theme';

type Props = {
  onUnlocked: () => void;
  onSignOut: () => void;
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function BiometricUnlockScreen({ onUnlocked, onSignOut }: Props) {
  const [status, setStatus] = useState<'checking' | 'prompt' | 'failed'>('checking');
  const [message, setMessage] = useState('');
  const onUnlockedRef = useRef(onUnlocked);
  const onSignOutRef = useRef(onSignOut);
  onUnlockedRef.current = onUnlocked;
  onSignOutRef.current = onSignOut;

  const authInFlightRef = useRef(false);

  const waitForActiveApp = useCallback(async () => {
    const state = AppState.currentState;
    if (state === 'active') return;
    await new Promise<void>((resolve) => {
      const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
        if (next === 'active') {
          sub.remove();
          resolve();
        }
      });
    });
  }, []);

  const authenticateOnce = useCallback(async (): Promise<boolean | 'retry'> => {
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!has || !enrolled) {
      setMessage('Biometrics are not set up on this device. You can turn this off in Profile.');
      setStatus('failed');
      return false;
    }

    // iOS: `NSFaceIDUsageDescription` in the native Info.plist is required for Face ID. The native module
    // uses biometrics-only policy when disableDeviceFallback is true, which matches Face ID / Touch ID.
    // Calling before the app is fully `active` often yields `invalid_context` (common right after splash).
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Lumio',
      cancelLabel: 'Cancel',
      ...(Platform.OS === 'ios'
        ? {
            fallbackLabel: 'Enter Passcode',
            // Biometrics-only on iOS so Face ID is used; passcode fallback still available via system UI when allowed by policy.
            disableDeviceFallback: true,
          }
        : {
            fallbackLabel: 'Use Passcode',
            disableDeviceFallback: false,
          }),
    });

    if (result.success) {
      onUnlockedRef.current();
      return true;
    }

    const err = result.error as string;
    if (typeof err === 'string' && err.startsWith('unknown:') && __DEV__) {
      console.warn('[BiometricUnlock]', err, (result as { warning?: string }).warning);
    }

    // Missing plist in native build — user must install a build that includes NSFaceIDUsageDescription.
    if (err === 'missing_usage_description') {
      setStatus('failed');
      setMessage(
        'Face ID needs an app update. Reinstall Lumio from your latest TestFlight or build, then try again. You can turn off Face ID in Profile.'
      );
      return false;
    }

    if (err === 'invalid_context') {
      return 'retry' as const;
    }

    setStatus('failed');
    const isUserCancel = err === 'user_cancel' || err === 'system_cancel' || err === 'app_cancel';
    setMessage(
      isUserCancel ? 'Authentication was cancelled. Try again when you’re ready.' : 'We could not verify you. Try again.'
    );
    return false;
  }, []);

  const tryAuth = useCallback(async () => {
    if (authInFlightRef.current) return;
    authInFlightRef.current = true;
    setStatus('prompt');
    setMessage('');
    try {
      await waitForActiveApp();
      await new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => resolve());
      });
      // Brief delay so the key window is ready for LAContext (avoids invalid_context on cold start).
      await delay(Platform.OS === 'ios' ? 350 : 100);

      let attempt = 0;
      const maxAttempts = Platform.OS === 'ios' ? 3 : 1;
      while (attempt < maxAttempts) {
        const outcome = await authenticateOnce();
        if (outcome === true) return;
        if (outcome === 'retry') {
          attempt += 1;
          await delay(400 * attempt);
          continue;
        }
        return;
      }
      setStatus('failed');
      setMessage('We could not open Face ID yet. Tap Try again, or sign out and turn off Face ID in Profile.');
    } catch (e) {
      if (__DEV__) console.warn('[BiometricUnlock]', e);
      setStatus('failed');
      setMessage('Something went wrong. Try again.');
    } finally {
      authInFlightRef.current = false;
    }
  }, [authenticateOnce, waitForActiveApp]);

  useEffect(() => {
    void tryAuth();
  }, [tryAuth]);

  return (
    <View style={[styles.container, { backgroundColor: HomeColorsDark.background }]}>
      {status === 'checking' ? (
        <ActivityIndicator size="large" color={HomeColorsDark.primary} />
      ) : (
        <>
          <Text style={[styles.title, { color: HomeColorsDark.foreground }]}>Unlock Lumio</Text>
          <Text style={[styles.sub, { color: HomeColorsDark.muted }]}>
            {Platform.OS === 'ios' ? 'Use Face ID or Touch ID to continue.' : 'Use your device biometrics to continue.'}
          </Text>
          {message ? <Text style={[styles.err, { color: HomeColorsDark.muted }]}>{message}</Text> : null}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: HomeColorsDark.primary }]}
            onPress={tryAuth}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: HomeColorsDark.primaryForeground }]}>
              Try again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => void onSignOutRef.current()}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryText, { color: HomeColorsDark.muted }]}>Sign out</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HomeSpacing.xl,
  },
  title: {
    fontSize: HomeTypography.fontSize['2xl'],
    fontWeight: HomeTypography.fontWeight.light,
    marginBottom: HomeSpacing.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: HomeTypography.fontSize.sm,
    textAlign: 'center',
    marginBottom: HomeSpacing.lg,
    lineHeight: HomeTypography.fontSize.sm * 1.5,
  },
  err: {
    fontSize: HomeTypography.fontSize.sm,
    textAlign: 'center',
    marginBottom: HomeSpacing.md,
  },
  primaryBtn: {
    paddingVertical: HomeSpacing.md,
    paddingHorizontal: HomeSpacing.xl,
    borderRadius: 999,
    marginBottom: HomeSpacing.md,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.medium,
  },
  secondaryBtn: {
    padding: HomeSpacing.sm,
  },
  secondaryText: {
    fontSize: HomeTypography.fontSize.sm,
  },
});
