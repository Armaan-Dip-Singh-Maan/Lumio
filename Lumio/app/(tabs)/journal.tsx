import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { TAB_BAR_HEIGHT } from '@/constants/navigation';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { JournalStorage, JournalEntry } from '@/utils/journal-storage';
import {
  groupEntriesByLocalDate,
  getMarkedDates,
  GroupedEntry,
} from '@/utils/journal-helpers';
import { CalendarMonth } from '@/components/journal/CalendarMonth';
import { JournalEntryCard } from '@/components/journal/JournalEntryCard';
import { DaySectionHeader } from '@/components/journal/DaySectionHeader';

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Map<string, View>>(new Map());
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntry[]>([]);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noEntryDate, setNoEntryDate] = useState<string | null>(null);

  // Load entries on mount
  React.useEffect(() => {
    const loadEntries = async () => {
      try {
        const allEntries = await JournalStorage.getAllEntries();
        setEntries(allEntries);
        
        const grouped = groupEntriesByLocalDate(allEntries);
        setGroupedEntries(grouped);
        
        const marked = getMarkedDates(allEntries);
        setMarkedDates(marked);
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    };
    
    loadEntries();
  }, []);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setNoEntryDate(null);
    
    // Find the section for this date and scroll to it
    const sectionView = sectionRefs.current.get(date);
    if (sectionView) {
      sectionView.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => {}
      );
    }
  };

  const handleNoEntryDate = (date: string) => {
    setNoEntryDate(date);
    setSelectedDate(null);
  };

  const handleEntryPress = (entry: JournalEntry) => {
    router.push(`/journal-read?id=${entry.id}`);
  };

  const handleWritePress = () => {
    router.push('/journal-write');
  };

  const toggleCalendar = () => {
    setIsCalendarExpanded(!isCalendarExpanded);
    setNoEntryDate(null);
  };


  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Nothing here yet.</Text>
      <Text style={styles.emptySubtitle}>Your first entry can be anything.</Text>
      <TouchableOpacity
        onPress={handleWritePress}
        style={styles.writeButton}
        activeOpacity={0.8}
      >
        <Text style={styles.writeButtonText}>Write</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNoEntryHint = () => {
    if (!noEntryDate) return null;
    
    return (
      <View style={styles.noEntryHint}>
        <Text style={styles.noEntryHintText}>No entry for this day.</Text>
        <TouchableOpacity
          onPress={handleWritePress}
          style={styles.writeButtonSmall}
          activeOpacity={0.8}
        >
          <Text style={styles.writeButtonSmallText}>Write</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: HomeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>Your thoughts over time</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleCalendar}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={'book.fill' as 'book.fill'}
              size={22}
              color={HomeColors.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleWritePress}
            style={styles.writePill}
            activeOpacity={0.8}
          >
            <Text style={styles.writePillText}>Write</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar */}
      <CalendarMonth
        markedDates={markedDates}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onNoEntryDate={handleNoEntryDate}
        isExpanded={isCalendarExpanded}
      />

      {/* No Entry Hint */}
      {renderNoEntryHint()}

      {/* Entries List */}
      {groupedEntries.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + HomeSpacing.xl },
          ]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {groupedEntries.map((group) => (
            <View
              key={group.date}
              ref={(ref) => {
                if (ref) {
                  sectionRefs.current.set(group.date, ref);
                }
              }}
            >
              <DaySectionHeader date={group.date} />
              {group.entries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} onPress={handleEntryPress} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: HomeSpacing.md,
    marginBottom: HomeSpacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: HomeTypography.fontSize['2xl'],
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HomeSpacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  writePill: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.xs,
    borderRadius: 16,
    backgroundColor: HomeColors.primary,
    minHeight: 32,
    justifyContent: 'center',
  },
  writePillText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.primaryForeground,
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HomeSpacing.md,
    paddingBottom: HomeSpacing.xl,
  },
  section: {
    marginBottom: HomeSpacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HomeSpacing.xl,
  },
  emptyTitle: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.sm,
    textAlign: 'center',
    opacity: 0.9,
  },
  emptySubtitle: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.xl,
    textAlign: 'center',
    opacity: 0.75,
  },
  writeButton: {
    paddingHorizontal: HomeSpacing.xl + 8,
    paddingVertical: HomeSpacing.md,
    borderRadius: 16,
    backgroundColor: HomeColors.primary,
    minWidth: 120,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeButtonText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.primaryForeground,
    letterSpacing: 0.3,
  },
  noEntryHint: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.md,
    alignItems: 'center',
  },
  noEntryHintText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
    marginBottom: HomeSpacing.sm,
  },
  writeButtonSmall: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.xs,
    borderRadius: 12,
    backgroundColor: HomeColors.primary,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeButtonSmallText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.primaryForeground,
    letterSpacing: 0.3,
  },
});
