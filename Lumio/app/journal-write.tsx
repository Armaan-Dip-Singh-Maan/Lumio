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
import { LinearGradient } from 'expo-linear-gradient';
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

// Get time of day context (e.g., "Evening")
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
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const saveStatusOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(8);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fade up animation on mount
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

  // Handle save/done
  const handleDone = useCallback(async () => {
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
  
  const saveStatusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: saveStatusOpacity.value,
  }));

  // Paper page colors - warm gray with subtle gradient
  const paperBackground = 'hsl(30, 6%, 12%)'; // Slightly lighter than background

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: HomeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <Animated.View style={[styles.contentContainer, containerAnimatedStyle]}>
        {/* Custom Top Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol
              name={'chevron.left' as 'chevron.left'}
              size={20}
              color={HomeColors.muted}
            />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{dateString}</Text>
            {timeContext && (
              <Text style={styles.timeContextText}>{timeContext}</Text>
            )}
          </View>

          <View style={styles.doneButton}>
            {saveStatus === 'saved' ? (
              <Animated.View style={saveStatusAnimatedStyle}>
                <Text style={styles.doneButtonText}>Saved</Text>
              </Animated.View>
            ) : (
              <TouchableOpacity
                onPress={handleDone}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Paper Page Container */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageContainer}>
            {/* Paper Surface with gradient and shadow */}
            <LinearGradient
              colors={[
                paperBackground,
                `${paperBackground}dd`,
                paperBackground,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.paperSurface}
            >
              {/* Prompt Header */}
              <View style={styles.promptHeader}>
                <Text style={styles.promptTitle}>Take a breath.</Text>
                <Text style={styles.promptSubtitle}>What's on your mind right now?</Text>
                <Text style={styles.promptHelper}>One sentence is enough.</Text>
              </View>

              {/* Writing Area */}
              <View style={styles.writingArea}>
                {!content && (
                  <View style={styles.placeholderContainer} pointerEvents="none">
                    <Text style={styles.placeholderText}>Start writing...</Text>
                  </View>
                )}
                <TextInput
                  ref={textInputRef}
                  style={styles.textInput}
                  value={content}
                  onChangeText={handleTextChange}
                  placeholder=""
                  placeholderTextColor="transparent"
                  multiline
                  autoFocus={!content}
                  textAlignVertical="top"
                  selectionColor={HomeColors.primary}
                  cursorColor={HomeColors.primary}
                />
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
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
    backgroundColor: HomeColors.background,
  },
  backButton: {
    width: 36,
    height: 36,
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
    opacity: 0.7,
  },
  timeContextText: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.5,
    marginTop: 2,
  },
  doneButton: {
    minWidth: 50,
    alignItems: 'flex-end',
    paddingVertical: 4,
  },
  doneButtonText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.primary,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: HomeSpacing.md,
    paddingTop: HomeSpacing.lg,
  },
  pageContainer: {
    width: '100%',
    maxWidth: 600, // Max width for larger screens
    alignSelf: 'center',
    marginBottom: HomeSpacing.xl,
  },
  paperSurface: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'hsla(40, 8%, 25%, 0.3)',
    backgroundColor: 'hsl(30, 6%, 12%)',
    shadowColor: 'hsla(0, 0%, 0%, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    minHeight: 600,
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 24,
    position: 'relative',
  },
  promptHeader: {
    marginBottom: 32,
    paddingTop: 8,
  },
  promptTitle: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 8,
    opacity: 0.95,
  },
  promptSubtitle: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 4,
    opacity: 0.8,
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.normal,
  },
  promptHelper: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.5,
    marginTop: 4,
  },
  writingArea: {
    flex: 1,
    minHeight: 400,
    position: 'relative',
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  placeholderText: {
    fontSize: 19,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: 0.3,
    lineHeight: 30,
    opacity: 0.3,
  },
  textInput: {
    flex: 1,
    fontSize: 19, // Premium writing size
    fontWeight: HomeTypography.fontWeight.regular,
    color: 'hsl(40, 20%, 88%)', // Softer than pure white, like ink on paper
    letterSpacing: 0.3,
    lineHeight: 30, // Comfortable line height for writing
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
