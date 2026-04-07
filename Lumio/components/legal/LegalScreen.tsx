import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HomeColorsDark, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalScreenProps = {
  title: string;
  updatedLabel: string;
  sections: LegalSection[];
};

export function LegalScreen({ title, updatedLabel, sections }: LegalScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: HomeColorsDark.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <IconSymbol name={'chevron.left' as 'chevron.left'} size={22} color={HomeColorsDark.muted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + HomeSpacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>{updatedLabel}</Text>
        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HomeSpacing.md,
    paddingBottom: HomeSpacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: HomeTypography.fontSize.lg,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.foreground,
    letterSpacing: HomeTypography.letterSpacing,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HomeSpacing.md,
    paddingTop: HomeSpacing.sm,
  },
  updated: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.85,
    marginBottom: HomeSpacing.lg,
  },
  section: {
    marginBottom: HomeSpacing.lg,
  },
  sectionHeading: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColorsDark.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.sm,
  },
  paragraph: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.muted,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: HomeTypography.fontSize.sm * HomeTypography.lineHeight.relaxed,
    marginBottom: HomeSpacing.sm,
  },
});
