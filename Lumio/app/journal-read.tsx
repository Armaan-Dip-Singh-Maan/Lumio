import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { JournalStorage, JournalEntry } from '@/utils/journal-storage';
import { formatDayHeader, formatTime } from '@/utils/journal-helpers';
import { getAIResponse } from '@/utils/services/ai';
import type { ChatMessage } from '@/utils/services/chat-storage';

export default function JournalReadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [reflectLoading, setReflectLoading] = useState(false);
  const [reflectText, setReflectText] = useState<string | null>(null);
  const [reflectError, setReflectError] = useState<string | null>(null);

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

  const handleShare = async () => {
    if (!entry) return;
    const header = `${formatDayHeader(entry.date)} · ${formatTime(entry.createdAt)}`;
    try {
      await Share.share({ message: `${header}\n\n${entry.content}` });
    } catch {
      /* dismissed */
    }
  };

  const handleCopy = async () => {
    if (!entry) return;
    await Clipboard.setStringAsync(entry.content);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReflect = async () => {
    if (!entry) return;
    setReflectLoading(true);
    setReflectError(null);
    setReflectText(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const messages: ChatMessage[] = [
      {
        id: `reflect_${entry.id}`,
        role: 'user',
        content: `The user wrote this private journal entry. Respond with a short gentle reflection only (2–4 sentences): warm, non-judgmental, no medical advice, no diagnosis. Entry:\n\n${entry.content}`,
        createdAt: Date.now(),
      },
    ];
    const { reply, error } = await getAIResponse(messages);
    setReflectLoading(false);
    if (error) setReflectError(error);
    else setReflectText(reply);
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
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleCopy} style={styles.headerIconBtn} activeOpacity={0.7}>
            <Text style={styles.headerActionText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerIconBtn} activeOpacity={0.7}>
            <Text style={styles.headerActionText}>Share</Text>
          </TouchableOpacity>
        </View>
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

        <Text style={styles.entryBody}>{entry.content}</Text>

        <TouchableOpacity
          style={styles.reflectButton}
          onPress={handleReflect}
          disabled={reflectLoading}
          activeOpacity={0.8}
        >
          {reflectLoading ? (
            <ActivityIndicator color={HomeColors.primaryForeground} size="small" />
          ) : (
            <Text style={styles.reflectButtonText}>Reflect with Lumio</Text>
          )}
        </TouchableOpacity>

        {reflectError ? (
          <Text style={styles.reflectError}>{reflectError}</Text>
        ) : null}
        {reflectText ? (
          <View style={styles.reflectBox}>
            <Text style={styles.reflectLabel}>Reflection</Text>
            <Text style={styles.reflectBody}>{reflectText}</Text>
          </View>
        ) : null}
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
    justifyContent: 'space-between',
    paddingHorizontal: HomeSpacing.md,
    paddingBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HomeSpacing.md,
  },
  headerIconBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  headerActionText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  entryBody: {
    fontSize: HomeTypography.fontSize.lg,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: HomeTypography.fontSize.lg * HomeTypography.lineHeight.relaxed,
    opacity: 0.95,
  },
  reflectButton: {
    marginTop: HomeSpacing.lg,
    alignSelf: 'flex-start',
    backgroundColor: HomeColors.primary,
    paddingVertical: HomeSpacing.sm,
    paddingHorizontal: HomeSpacing.md,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  reflectButtonText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.primaryForeground,
    letterSpacing: HomeTypography.letterSpacing,
  },
  reflectError: {
    marginTop: HomeSpacing.sm,
    fontSize: HomeTypography.fontSize.sm,
    color: HomeColors.muted,
  },
  reflectBox: {
    marginTop: HomeSpacing.md,
    padding: HomeSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HomeColors.border,
    backgroundColor: HomeColors.glassBackground,
  },
  reflectLabel: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    marginBottom: HomeSpacing.xs,
    letterSpacing: HomeTypography.letterSpacing,
  },
  reflectBody: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.relaxed,
    letterSpacing: HomeTypography.letterSpacing,
  },
  loadingText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    textAlign: 'center',
    opacity: 0.7,
  },
});

