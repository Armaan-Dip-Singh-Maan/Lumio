import React, { useState, useEffect } from 'react';
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
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AuthStorage } from '@/utils/auth-storage';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { SettingsToggle } from '@/components/profile/SettingsToggle';
import { SettingsSelector } from '@/components/profile/SettingsSelector';

type Theme = 'system' | 'dark' | 'light';
type TextSize = 'small' | 'default' | 'large';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('system');
  const [textSize, setTextSize] = useState<TextSize>('default');
  const [dailyReminder, setDailyReminder] = useState(false);
  const [affirmations, setAffirmations] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [blankPage, setBlankPage] = useState(false);
  const [moodCheckIn, setMoodCheckIn] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userEmail = await AuthStorage.getUserEmail();
        if (userEmail) {
          setEmail(userEmail);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await AuthStorage.clearAuth();
            router.replace('/auth');
          },
        },
      ]
    );
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
            // In production, this would call an API to delete the account
            await AuthStorage.clearAuth();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleExportJournal = () => {
    // In production, this would export journal entries
    Alert.alert('Export Journal', 'Journal export feature coming soon.');
  };

  const handleAbout = () => {
    Alert.alert('About Lumio', 'Lumio is a calm space for reflection and growth.');
  };

  const handleShareFeedback = () => {
    // In production, this would open feedback form or email
    Alert.alert('Share Feedback', 'Feedback feature coming soon.');
  };

  const handlePrivacyPolicy = () => {
    // In production, this would open privacy policy
    Alert.alert('Privacy Policy', 'Privacy policy coming soon.');
  };

  const handleTerms = () => {
    // In production, this would open terms of service
    Alert.alert('Terms of Service', 'Terms of service coming soon.');
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
      <Text style={[styles.actionButtonText, destructive && styles.actionButtonTextDestructive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: HomeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + HomeSpacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section - Avatar and Email */}
        <View style={styles.topSection}>
          <BlurView intensity={20} tint="dark" style={styles.avatarContainer}>
            <IconSymbol
              name={'person.fill' as 'person.fill'}
              size={32}
              color={HomeColors.muted}
            />
          </BlurView>
          {email ? (
            <Text style={styles.emailText}>{email}</Text>
          ) : (
            <Text style={styles.emailText}>Loading...</Text>
          )}
        </View>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
            <SettingsSelector
              label="Theme"
              value={theme}
              options={[
                { label: 'System', value: 'system' },
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
              ]}
              onValueChange={setTheme}
            />
            <SettingsSelector
              label="Text Size"
              value={textSize}
              options={[
                { label: 'Small', value: 'small' },
                { label: 'Default', value: 'default' },
                { label: 'Large', value: 'large' },
              ]}
              onValueChange={setTextSize}
            />
          </BlurView>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
            <SettingsToggle
              label="Daily journal reminder"
              value={dailyReminder}
              onValueChange={setDailyReminder}
              subtext="A gentle reminder to reflect."
            />
            <SettingsToggle
              label="Occasional affirmations"
              value={affirmations}
              onValueChange={setAffirmations}
              subtext="Words of encouragement when you need them."
            />
          </BlurView>
        </SettingsSection>

        {/* Privacy Section */}
        <SettingsSection title="Privacy">
          <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
            <SettingsToggle
              label={`Use ${Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Biometrics'}`}
              value={useBiometrics}
              onValueChange={setUseBiometrics}
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

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
            <SettingsToggle
              label="Show a gentle prompt before writing"
              value={showPrompt}
              onValueChange={setShowPrompt}
            />
            <SettingsToggle
              label="Start with a blank page"
              value={blankPage}
              onValueChange={setBlankPage}
            />
            <SettingsToggle
              label="Ask for mood check-in when opening the app"
              value={moodCheckIn}
              onValueChange={setMoodCheckIn}
            />
          </BlurView>
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account">
          <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{email || 'Loading...'}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Login Method</Text>
              <Text style={styles.accountValue}>Email</Text>
            </View>
            {renderActionButton('Sign out', handleSignOut)}
            <View style={styles.separator} />
            {renderActionButton('Delete my account', handleDeleteAccount, true)}
          </BlurView>
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
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

const styles = StyleSheet.create({
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
    color: HomeColors.foreground,
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
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HomeSpacing.md,
  },
  emailText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.8,
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    overflow: 'hidden',
  },
  actionButton: {
    paddingVertical: HomeSpacing.md,
    paddingHorizontal: HomeSpacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HomeColors.border,
  },
  actionButtonDestructive: {
    borderBottomWidth: 0,
  },
  actionButtonText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
  },
  actionButtonTextDestructive: {
    color: HomeColors.muted,
    opacity: 0.7,
  },
  privacyNote: {
    paddingVertical: HomeSpacing.md,
    paddingHorizontal: HomeSpacing.md,
  },
  privacyNoteText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
    lineHeight: HomeTypography.fontSize.sm * HomeTypography.lineHeight.relaxed,
  },
  accountInfo: {
    paddingVertical: HomeSpacing.md,
    paddingHorizontal: HomeSpacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HomeColors.border,
  },
  accountLabel: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 4,
    opacity: 0.8,
  },
  accountValue: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
  },
  separator: {
    height: HomeSpacing.md,
  },
});
