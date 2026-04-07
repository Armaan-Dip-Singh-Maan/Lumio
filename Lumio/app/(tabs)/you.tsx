import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { HomeColorsDark, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import type { HomePalette } from '@/constants/home-theme';
import { TAB_BAR_HEIGHT } from '@/constants/navigation';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { SettingsToggle } from '@/components/profile/SettingsToggle';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { JournalStorage } from '@/utils/journal-storage';
import { shareJournalMarkdown } from '@/utils/journal-export';

function buildStyles(colors: HomePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: HomeSpacing.md,
      marginBottom: HomeSpacing.sm,
    },
    headerTitle: {
      fontSize: HomeTypography.fontSize['2xl'],
      fontWeight: HomeTypography.fontWeight.light,
      color: colors.foreground,
      letterSpacing: HomeTypography.letterSpacing,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: HomeSpacing.md,
      paddingTop: HomeSpacing.md,
    },
    topSection: {
      alignItems: 'center',
      marginBottom: HomeSpacing.xl,
      paddingTop: HomeSpacing.md,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.glassBackground,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: HomeSpacing.md,
    },
    emailText: {
      fontSize: HomeTypography.fontSize.base,
      fontWeight: HomeTypography.fontWeight.light,
      color: colors.muted,
      letterSpacing: HomeTypography.letterSpacing,
      opacity: 0.8,
    },
    sectionCard: {
      borderRadius: 16,
      backgroundColor: colors.glassBackground,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
    },
    actionButton: {
      paddingVertical: HomeSpacing.md,
      paddingHorizontal: HomeSpacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    actionButtonDestructive: {
      borderBottomWidth: 0,
    },
    actionButtonText: {
      fontSize: HomeTypography.fontSize.base,
      fontWeight: HomeTypography.fontWeight.regular,
      color: colors.foreground,
      letterSpacing: HomeTypography.letterSpacing,
    },
    actionButtonTextDestructive: {
      color: colors.muted,
      opacity: 0.7,
    },
    privacyNote: {
      paddingVertical: HomeSpacing.md,
      paddingHorizontal: HomeSpacing.md,
    },
    privacyNoteText: {
      fontSize: HomeTypography.fontSize.sm,
      fontWeight: HomeTypography.fontWeight.light,
      color: colors.muted,
      letterSpacing: HomeTypography.letterSpacing,
      opacity: 0.7,
      lineHeight: HomeTypography.fontSize.sm * HomeTypography.lineHeight.relaxed,
    },
    accountInfo: {
      paddingVertical: HomeSpacing.md,
      paddingHorizontal: HomeSpacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    accountLabel: {
      fontSize: HomeTypography.fontSize.sm,
      fontWeight: HomeTypography.fontWeight.light,
      color: colors.muted,
      letterSpacing: HomeTypography.letterSpacing,
      marginBottom: 4,
      opacity: 0.8,
    },
    accountValue: {
      fontSize: HomeTypography.fontSize.base,
      fontWeight: HomeTypography.fontWeight.regular,
      color: colors.foreground,
      letterSpacing: HomeTypography.letterSpacing,
    },
    separator: {
      height: HomeSpacing.md,
    },
  });
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();

  const {
    colors,
    biometricsEnabled,
    setBiometricsEnabled,
    showGentlePrompt,
    setShowGentlePrompt,
    startBlankPage,
    setStartBlankPage,
    moodCheckInOnOpen,
    setMoodCheckInOnOpen,
  } = useAppTheme();

  const styles = useMemo(() => buildStyles(colors), [colors]);
  const blurTint = 'dark' as const;

  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    null;

  const firstOAuth = user?.externalAccounts?.[0];
  const providerStr =
    firstOAuth?.provider != null ? String(firstOAuth.provider) : '';
  const loginMethod = firstOAuth
    ? providerStr.includes('google')
      ? 'Google'
      : providerStr.includes('apple')
        ? 'Apple'
        : 'OAuth'
    : 'Email';

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)');
          } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your journal entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert('About Lumio', 'Lumio is a calm space for reflection and growth.');
  };

  const handleShareFeedback = () => {
    Alert.alert('Share Feedback', 'Feedback feature coming soon.');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleTerms = () => {
    router.push('/terms-of-service');
  };

  const handleExportJournal = async () => {
    try {
      const entries = await JournalStorage.getAllEntries();
      if (entries.length === 0) {
        Alert.alert('Nothing to export', 'Write a journal entry first.');
        return;
      }
      await shareJournalMarkdown(entries);
    } catch (e) {
      console.error(e);
      Alert.alert('Export failed', 'Please try again.');
    }
  };

  const renderActionButton = (
    label: string,
    onPress: () => void,
    destructive = false
  ) => (
    <TouchableOpacity
      style={[styles.actionButton, destructive && styles.actionButtonDestructive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.actionButtonText, destructive && styles.actionButtonTextDestructive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: HomeColorsDark.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + HomeSpacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <BlurView intensity={28} tint={blurTint} style={styles.avatarContainer}>
            <IconSymbol
              name={'person.fill' as 'person.fill'}
              size={32}
              color={colors.muted}
            />
          </BlurView>
          {userLoaded ? (
            userEmail ? (
              <Text style={styles.emailText}>{userEmail}</Text>
            ) : (
              <Text style={styles.emailText}>No email available</Text>
            )
          ) : (
            <Text style={styles.emailText}>Loading...</Text>
          )}
        </View>

        <SettingsSection title="Privacy">
          <BlurView intensity={28} tint={blurTint} style={styles.sectionCard}>
            <SettingsToggle
              label={`Use ${Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Biometrics'}`}
              value={biometricsEnabled}
              onValueChange={(v) => void setBiometricsEnabled(v)}
              subtext="Extra privacy when opening Lumio."
            />
            {renderActionButton('Export my journal', handleExportJournal)}
            <View style={styles.privacyNote}>
              <Text style={styles.privacyNoteText}>
                Your journal is private. Lumio never shares your thoughts.
              </Text>
            </View>
          </BlurView>
        </SettingsSection>

        <SettingsSection title="Preferences">
          <BlurView intensity={28} tint={blurTint} style={styles.sectionCard}>
            <SettingsToggle
              label="Show a gentle prompt before writing"
              value={showGentlePrompt}
              onValueChange={(v) => void setShowGentlePrompt(v)}
            />
            <SettingsToggle
              label="Start with a blank page"
              value={startBlankPage}
              onValueChange={(v) => void setStartBlankPage(v)}
            />
            <SettingsToggle
              label="Mood check-in on Home"
              value={moodCheckInOnOpen}
              onValueChange={(v) => void setMoodCheckInOnOpen(v)}
              subtext="We only ask once, the first time you open Home."
            />
          </BlurView>
        </SettingsSection>

        <SettingsSection title="Account">
          <BlurView intensity={28} tint={blurTint} style={styles.sectionCard}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>
                {userLoaded ? userEmail || 'No email available' : 'Loading...'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Login Method</Text>
              <Text style={styles.accountValue}>{loginMethod}</Text>
            </View>
            {renderActionButton('Sign out', handleSignOut)}
            <View style={styles.separator} />
            {renderActionButton('Delete my account', handleDeleteAccount, true)}
          </BlurView>
        </SettingsSection>

        <SettingsSection title="About">
          <BlurView intensity={28} tint={blurTint} style={styles.sectionCard}>
            {renderActionButton('About Lumio', handleAbout)}
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>App Version</Text>
              <Text style={styles.accountValue}>1.0.0</Text>
            </View>
            {renderActionButton('Share feedback', handleShareFeedback)}
            {renderActionButton('Privacy Policy', handlePrivacyPolicy)}
            {renderActionButton('Terms of Service', handleTerms)}
          </BlurView>
        </SettingsSection>
      </ScrollView>
    </View>
  );
}
