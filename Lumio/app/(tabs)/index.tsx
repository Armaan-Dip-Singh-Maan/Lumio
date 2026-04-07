import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TopBar } from '@/components/home/TopBar';
import { PrimaryJournalCard } from '@/components/home/PrimaryJournalCard';
import { PlanGently, Task } from '@/components/home/PlanGently';
import { TaskItem } from '@/components/home/TaskItem';
import { MoodIndicator } from '@/components/home/MoodIndicator';
import { HomeColorsDark, HomeSpacing, HomeTypography } from '@/constants/home-theme';
import { TAB_BAR_HEIGHT } from '@/constants/navigation';
import { useAppTheme } from '@/contexts/AppThemeContext';
import {
  hasMoodPromptBeenCompleted,
  setMoodPromptCompleted,
} from '@/utils/preferences-storage';
import { JournalStorage } from '@/utils/journal-storage';
import { getJournalStats } from '@/utils/journal-stats';
import { loadTasks, saveTasks } from '@/utils/task-storage';

export default function HomeScreen() {
  const { moodCheckInOnOpen } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tasksHydrated = useRef(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journalStats, setJournalStats] = useState({
    streakDays: 0,
    daysThisMonth: 0,
    hasEntryToday: false,
    totalEntries: 0,
  });
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [viewAllTasksVisible, setViewAllTasksVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [mood, setMood] = useState<{ emoji: string; label: string } | null>(null);
  const moodPromptGate = useRef(false);

  const refreshJournalStats = useCallback(async () => {
    const entries = await JournalStorage.getAllEntries();
    setJournalStats(getJournalStats(entries));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadTasks();
      if (!cancelled) {
        setTasks(loaded);
        tasksHydrated.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    refreshJournalStats();
  }, [refreshJournalStats]);

  useFocusEffect(
    useCallback(() => {
      refreshJournalStats();
    }, [refreshJournalStats])
  );

  useEffect(() => {
    if (!tasksHydrated.current) return;
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (!moodCheckInOnOpen || moodPromptGate.current) return;

    let cancelled = false;
    (async () => {
      if (await hasMoodPromptBeenCompleted()) return;
      if (cancelled) return;
      moodPromptGate.current = true;

      Alert.alert('How are you feeling?', 'A quick check-in for today.', [
        {
          text: 'Calm',
          onPress: async () => {
            setMood({ emoji: '🌿', label: 'Calm' });
            await setMoodPromptCompleted();
          },
        },
        {
          text: 'Okay',
          onPress: async () => {
            setMood({ emoji: '☁️', label: 'Okay' });
            await setMoodPromptCompleted();
          },
        },
        {
          text: 'Heavy',
          onPress: async () => {
            setMood({ emoji: '🌧️', label: 'Heavy' });
            await setMoodPromptCompleted();
          },
        },
        {
          text: 'Skip',
          style: 'cancel',
          onPress: async () => {
            await setMoodPromptCompleted();
          },
        },
      ]);
    })();

    return () => {
      cancelled = true;
    };
  }, [moodCheckInOnOpen]);

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(20);

  React.useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    containerTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const handleWritePress = () => {
    router.push('/journal-write');
  };

  const handleToggleTask = (id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleAddTask = () => {
    setNewTaskTitle('');
    setAddTaskModalVisible(true);
  };

  const handleAddTaskSubmit = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title,
        priority: 'medium' as const,
        completed: false,
      },
    ]);
    setNewTaskTitle('');
    setAddTaskModalVisible(false);
  };

  const handleAddTaskDismiss = () => {
    setNewTaskTitle('');
    setAddTaskModalVisible(false);
  };

  const handleViewAll = () => {
    setViewAllTasksVisible(true);
  };

  const handleViewAllDismiss = () => {
    setViewAllTasksVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: HomeColorsDark.background }]}>
      <Modal
        visible={addTaskModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleAddTaskDismiss}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleAddTaskDismiss} />
          <BlurView intensity={36} tint="dark" style={styles.modalCard}>
            <Text style={styles.modalTitle}>New task</Text>
            <TextInput
              style={styles.modalInput}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="One small step…"
              placeholderTextColor={HomeColorsDark.muted}
              autoFocus
              autoCorrect
              returnKeyType="done"
              onSubmitEditing={handleAddTaskSubmit}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleAddTaskDismiss}
                style={styles.modalButton}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextMuted}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddTaskSubmit}
                style={styles.modalButton}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={viewAllTasksVisible}
        animationType="slide"
        onRequestClose={handleViewAllDismiss}
      >
        <View
          style={[
            styles.allTasksRoot,
            { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 },
          ]}
        >
          <View style={styles.allTasksHeader}>
            <Text style={styles.allTasksTitle}>Plan gently</Text>
            <TouchableOpacity
              onPress={handleViewAllDismiss}
              style={styles.allTasksDone}
              activeOpacity={0.7}
            >
              <Text style={styles.allTasksDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.allTasksSubtitle}>One small step is enough.</Text>
          <ScrollView
            style={styles.allTasksScroll}
            contentContainerStyle={styles.allTasksScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                id={task.id}
                title={task.title}
                priority={task.priority}
                completed={task.completed}
                onToggleComplete={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </ScrollView>
        </View>
      </Modal>

      <TopBar />
      
      <Animated.View style={[styles.scrollContainer, containerStyle]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + HomeSpacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <PrimaryJournalCard
            hasEntryToday={journalStats.hasEntryToday}
            streakSummary={
              journalStats.totalEntries > 0
                ? `${journalStats.streakDays}-day streak · ${journalStats.daysThisMonth} days this month`
                : null
            }
            onWritePress={handleWritePress}
          />

          <PlanGently
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onViewAll={tasks.length > 3 ? handleViewAll : undefined}
          />

          {mood && (
            <MoodIndicator
              mood={mood.label}
              emoji={mood.emoji}
              onPress={() => console.log('Edit mood')}
            />
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: HomeSpacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  modalCard: {
    borderRadius: 16,
    padding: HomeSpacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: HomeColorsDark.glassBorder,
    backgroundColor: 'hsla(30, 8%, 6%, 0.35)',
  },
  modalTitle: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'hsla(40, 10%, 28%, 0.45)',
    borderRadius: 10,
    paddingHorizontal: HomeSpacing.sm,
    paddingVertical: 12,
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: HomeSpacing.md,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: HomeSpacing.sm,
  },
  modalButtonText: {
    fontSize: HomeTypography.fontSize.lg,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.foreground,
    letterSpacing: HomeTypography.letterSpacing,
  },
  modalButtonTextMuted: {
    fontSize: HomeTypography.fontSize.lg,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.85,
  },
  allTasksRoot: {
    flex: 1,
    backgroundColor: HomeColorsDark.background,
    paddingHorizontal: HomeSpacing.md,
  },
  allTasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  allTasksTitle: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.foreground,
    letterSpacing: HomeTypography.letterSpacing,
  },
  allTasksDone: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  allTasksDoneText: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.foreground,
    letterSpacing: HomeTypography.letterSpacing,
  },
  allTasksSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: HomeColorsDark.muted,
    marginBottom: HomeSpacing.md,
    opacity: 0.85,
  },
  allTasksScroll: {
    flex: 1,
  },
  allTasksScrollContent: {
    paddingBottom: HomeSpacing.lg,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
