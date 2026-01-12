import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { JournalStorage, JournalEntry } from '@/utils/journal-storage';

// Format date as "Sunday · Jan 11"
function getJournalDateString(): string {
  const date = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  
  return `${dayName} · ${monthName} ${day}`;
}

// Get time of day context (e.g., "Late evening")
function getTimeOfDayContext(): string | null {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 8) {
    return 'Early morning';
  } else if (hour >= 8 && hour < 12) {
    return null; // Morning, no context needed
  } else if (hour >= 12 && hour < 17) {
    return null; // Afternoon, no context needed
  } else if (hour >= 17 && hour < 21) {
    return 'Evening';
  } else if (hour >= 21 && hour < 24) {
    return 'Late evening';
  } else {
    return 'Late night';
  }
}

// Get date key for today (YYYY-MM-DD)
function getTodayDateKey(): string {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

export default function JournalWriteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const textInputRef = useRef<TextInput>(null);
  
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  
  const saveStatusOpacity = useSharedValue(0);
  const entryCardOpacity = useSharedValue(1);
  const entryCardTranslateY = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(8);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fade up animation on entry
  useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    containerTranslateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  // Auto-focus on mount (only if no existing content)
  useEffect(() => {
    if (!content) {
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  // Load existing entry for today
  useEffect(() => {
    const loadTodayEntry = async () => {
      try {
        const todayKey = getTodayDateKey();
        const entry = await JournalStorage.getEntryByDate(todayKey);
        if (entry) {
          setContent(entry.content);
          setEntryId(entry.id);
          setCreatedAt(entry.createdAt);
          setHasStartedTyping(entry.content.length > 0);
          // Fade out entry card if content exists
          if (entry.content.length > 0) {
            entryCardOpacity.value = withTiming(0.3, {
              duration: 300,
              easing: Easing.out(Easing.ease),
            });
          }
        }
      } catch (error) {
        console.error('Error loading entry:', error);
      }
    };
    
    loadTodayEntry();
  }, []);

  // Auto-save function with debounce
  const saveEntry = useCallback(async (text: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const todayKey = getTodayDateKey();
        const now = Date.now();
        
        const entry: JournalEntry = {
          id: entryId || `entry_${now}`,
          content: text,
          date: todayKey,
          createdAt: createdAt || now,
          updatedAt: now,
        };

        await JournalStorage.saveEntry(entry);
        if (!entryId) {
          setEntryId(entry.id);
        }

        // Show save status
        setSaveStatus('saved');
        saveStatusOpacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
        
        setTimeout(() => {
          saveStatusOpacity.value = withTiming(0, {
            duration: 300,
            easing: Easing.in(Easing.ease),
          });
          setTimeout(() => {
            setSaveStatus(null);
          }, 300);
        }, 1200);
      } catch (error) {
        console.error('Error saving entry:', error);
      }
    }, 1500); // 1.5 second debounce
  }, [entryId, createdAt]);

  // Handle text change
  const handleTextChange = (text: string) => {
    setContent(text);
    
    // Fade entry card when user starts typing
    if (!hasStartedTyping && text.length > 0) {
      setHasStartedTyping(true);
      entryCardOpacity.value = withTiming(0.3, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    } else if (hasStartedTyping && text.length === 0) {
      setHasStartedTyping(false);
      entryCardOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    }
    
    saveEntry(text);
  };

  // Handle back press
  const handleBack = useCallback(async () => {
    // Clear any pending saves and save immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (content.trim()) {
      await saveEntry(content);
    }
    
    router.back();
  }, [content, saveEntry, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const dateString = getJournalDateString();
  const timeContext = getTimeOfDayContext();
  
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));
  
  const entryCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: entryCardOpacity.value,
    transform: [{ translateY: entryCardTranslateY.value }],
  }));
  
  const saveStatusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: saveStatusOpacity.value,
  }));

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: HomeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <Animated.View style={[styles.contentContainer, containerAnimatedStyle]}>
        {/* Top Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol
              name={'chevron.left' as 'chevron.left'}
              size={22}
              color={HomeColors.muted}
            />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{dateString}</Text>
            {timeContext && (
              <Text style={styles.timeContextText}>{timeContext}</Text>
            )}
          </View>

          <Animated.View style={[styles.saveStatusContainer, saveStatusAnimatedStyle]}>
            <Text style={styles.saveStatusText}>Saved</Text>
          </Animated.View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Gentle Entry Card */}
          <Animated.View 
            style={[styles.entryCardContainer, entryCardAnimatedStyle]}
            pointerEvents="none"
          >
            <BlurView intensity={20} tint="dark" style={styles.entryCardBlur}>
              <View style={styles.entryCardContent}>
                <Text style={styles.entryCardTitle}>Take a breath.</Text>
                <Text style={styles.entryCardPrompt}>What's on your mind right now?</Text>
              </View>
            </BlurView>
          </Animated.View>

          {/* Writing Area */}
          <View style={styles.writingContainer}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              value={content}
              onChangeText={handleTextChange}
              placeholder="One sentence is enough."
              placeholderTextColor={HomeColors.muted}
              multiline
              autoFocus={!content}
              textAlignVertical="top"
              selectionColor={HomeColors.primary}
            />
          </View>
        </ScrollView>

        {/* Safety Anchor */}
        <View style={[styles.safetyAnchor, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.safetyAnchorText}>Your thoughts are private.</Text>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HomeSpacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  dateContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.75,
  },
  timeContextText: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.6,
    marginTop: 2,
  },
  saveStatusContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  saveStatusText: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: HomeSpacing.md,
  },
  entryCardContainer: {
    marginTop: HomeSpacing.lg,
    marginBottom: HomeSpacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },
  entryCardBlur: {
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
  },
  entryCardContent: {
    padding: HomeSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryCardTitle: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.sm,
    textAlign: 'center',
    opacity: 0.95,
  },
  entryCardPrompt: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    textAlign: 'center',
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.relaxed,
    opacity: 0.85,
  },
  writingContainer: {
    flex: 1,
    minHeight: 200,
  },
  textInput: {
    flex: 1,
    fontSize: HomeTypography.fontSize.lg + 2,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: (HomeTypography.fontSize.lg + 2) * HomeTypography.lineHeight.relaxed,
    paddingTop: 0,
    paddingBottom: HomeSpacing.xl,
    opacity: 0.95,
  },
  safetyAnchor: {
    paddingHorizontal: HomeSpacing.md,
    paddingTop: HomeSpacing.md,
    alignItems: 'center',
  },
  safetyAnchorText: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.5,
  },
});
