import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export type TaskPriority = 'high' | 'medium' | 'low';

interface TaskItemProps {
  id: string;
  title: string;
  priority: TaskPriority;
  completed?: boolean;
  onToggleComplete: (id: string) => void;
}

const priorityColors = {
  high: HomeColors.priorityHigh,
  medium: HomeColors.priorityMedium,
  low: HomeColors.priorityLow,
};

export function TaskItem({ id, title, priority, completed = false, onToggleComplete }: TaskItemProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(completed ? 0.55 : 1);

  useEffect(() => {
    if (completed) {
      opacity.value = withTiming(0.55, { duration: 300 });
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  const handlePress = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }, () => {
      scale.value = withSpring(completed ? 0.98 : 1, { damping: 15, stiffness: 300 });
    });
    onToggleComplete(id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[priority] }]} />
      <TouchableOpacity
        onPress={handlePress}
        style={styles.content}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.title,
            completed && styles.titleCompleted,
          ]}
        >
          {title}
        </Text>
        <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>
          {completed && <View style={styles.checkmark} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HomeSpacing.md,
  },
  priorityIndicator: {
    width: 3,
    height: 40,
    borderRadius: 2,
    marginRight: HomeSpacing.md,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HomeSpacing.sm,
  },
  title: {
    flex: 1,
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.normal,
    opacity: 0.95,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HomeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: HomeSpacing.md,
  },
  checkboxCompleted: {
    backgroundColor: HomeColors.primary,
    borderColor: HomeColors.primary,
  },
  checkmark: {
    width: 6,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: HomeColors.primaryForeground,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
  },
});

