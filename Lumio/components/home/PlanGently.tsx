import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayTasks = tasks.slice(0, 3);
  const hasMoreTasks = tasks.length > 3;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan gently</Text>
        <Text style={styles.subtitle}>One small step is enough.</Text>
      </View>

      <Animated.View style={animatedStyle}>
        <BlurView intensity={24} tint="dark" style={styles.card}>
          {displayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                If you'd like, add a small task.
              </Text>
              <Animated.View style={animatedStyle}>
                <TouchableOpacity
                  onPress={onAddTask}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.addButton}
                  activeOpacity={0.8}
                >
                  <IconSymbol
                    name={'plus' as 'plus'}
                    size={20}
                    color={HomeColors.muted}
                  />
                  <Text style={styles.addButtonText}>Add a task</Text>
                </TouchableOpacity>
              </Animated.View>
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
    marginBottom: HomeSpacing.md,
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HomeSpacing.xl,
  },
  emptyText: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    textAlign: 'center',
    marginBottom: HomeSpacing.lg,
    letterSpacing: HomeTypography.letterSpacing,
  },
  addButton: {
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

