import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TaskItem, TaskPriority } from './TaskItem';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  completed?: boolean;
}

interface PlanGentlyProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: () => void;
  onViewAll?: () => void;
}

export function PlanGently({ tasks, onToggleTask, onAddTask, onViewAll }: PlanGentlyProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const displayTasks = tasks.slice(0, 3);
  const hasMoreTasks = tasks.length > 3;

  return (
    <View style={styles.container}>
      {displayTasks.length > 0 && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Plan gently</Text>
            <Text style={styles.subtitle}>One small step is enough.</Text>
          </View>
          <TouchableOpacity
            onPress={onAddTask}
            style={styles.headerAddButton}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={'plus' as 'plus'}
              size={18}
              color={HomeColors.muted}
            />
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={animatedStyle}>
        <BlurView intensity={24} tint="dark" style={styles.card}>
          {displayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Plan gently</Text>
              <Text style={styles.emptySubtitle}>One small step is enough.</Text>
              <TouchableOpacity
                onPress={onAddTask}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.emptyAddButton}
                activeOpacity={0.8}
              >
                <IconSymbol
                  name={'plus' as 'plus'}
                  size={20}
                  color={HomeColors.muted}
                />
                <Text style={styles.addButtonText}>Add a task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {displayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  priority={task.priority}
                  completed={task.completed}
                  onToggleComplete={onToggleTask}
                />
              ))}

              {hasMoreTasks && (
                <TouchableOpacity
                  onPress={onViewAll}
                  style={styles.viewAllButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: HomeSpacing.md,
    marginBottom: HomeSpacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: HomeSpacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.xs / 2,
  },
  subtitle: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.85,
  },
  headerAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    opacity: 0.8,
  },
  card: {
    borderRadius: 20,
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    padding: HomeSpacing.lg,
    shadowColor: HomeColors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
    minHeight: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HomeSpacing.lg,
  },
  emptyTitle: {
    fontSize: HomeTypography.fontSize.xl,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.xs / 2,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    textAlign: 'center',
    marginBottom: HomeSpacing.lg,
    opacity: 0.85,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HomeSpacing.md,
    paddingHorizontal: HomeSpacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HomeColors.border,
    gap: HomeSpacing.sm,
  },
  addButtonText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
  },
  tasksContainer: {
    gap: HomeSpacing.sm,
  },
  viewAllButton: {
    marginTop: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.8,
  },
});

