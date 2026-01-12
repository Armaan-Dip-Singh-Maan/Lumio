import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { JournalStorage, JournalEntry } from '@/utils/journal-storage';
import { formatDayHeader, formatTime } from '@/utils/journal-helpers';

export default function JournalReadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      if (!id) return;
      
      try {
        const loadedEntry = await JournalStorage.getEntryById(id);
        setEntry(loadedEntry);
      } catch (error) {
        console.error('Error loading entry:', error);
      }
    };
    
    loadEntry();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: HomeColors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <IconSymbol
              name={'chevron.left' as 'chevron.left'}
              size={24}
              color={HomeColors.foreground}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const dateHeader = formatDayHeader(entry.date);
  const timeString = formatTime(entry.createdAt);

  return (
    <View style={[styles.container, { backgroundColor: HomeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol
            name={'chevron.left' as 'chevron.left'}
            size={24}
            color={HomeColors.foreground}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateContainer}>
          <Text style={styles.dateHeader}>{dateHeader}</Text>
          <Text style={styles.time}>{timeString}</Text>
        </View>

        <Text style={styles.content}>{entry.content}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HomeSpacing.md,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HomeSpacing.md,
    paddingBottom: HomeSpacing.xl,
  },
  dateContainer: {
    marginBottom: HomeSpacing.xl,
  },
  dateHeader: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.8,
    marginBottom: HomeSpacing.xs / 2,
  },
  time: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
  },
  content: {
    fontSize: HomeTypography.fontSize.lg,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: HomeTypography.fontSize.lg * HomeTypography.lineHeight.relaxed,
    opacity: 0.95,
  },
  loadingText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    textAlign: 'center',
    opacity: 0.7,
  },
});

